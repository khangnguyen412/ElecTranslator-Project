/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import AppConfig from "@/config/app.config";

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestStartBackendThunk } from '@/redux/features/check';

/**
 * Ant Design
 */
import { Progress, Typography, Card, Col, Divider, Row, Space, Tag, Alert, Button } from 'antd';
import { ApiOutlined, CheckCircleFilled, ClockCircleOutlined, CloseCircleFilled, PythonOutlined, LoadingOutlined, } from '@ant-design/icons';

/**
 * Styles
 */
import "@/assets/scss/page/checking.scss";

/**
 * Type
 */
import type { CheckStatus, CheckItem } from "@/types/check.type";

const POLL_MS = 2000;
const DEADLINE_MS = 5 * 60_000;
const BACKEND_TRIES = 15;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check items content (runtime, backend)
 */
const ITEMS: CheckItem[] = [
    {
        key: 'runtime',
        title: 'Python Runtime',
        description: 'Embedded Python Runtime',
        meta: "poll pythonStatus() • every 2s • deadline 10'",
        icon: <PythonOutlined />,
        status: 'loading',
        detail: 'Preparing...',
    },
    {
        key: 'backend',
        title: 'Backend',
        description: `FastAPI service on port ${AppConfig.API_PORT}`,
        meta: "startBackend() + health poll 15s",
        icon: <ApiOutlined />,
        status: 'waiting',
        detail: 'Pending...',
    },
];

/**
 * Status tag component
 */
const StatusTag: React.FC<{ status: CheckStatus; detail?: string }> = ({ status, detail }) => {
    return ({
        success: <Tag icon={<CheckCircleFilled />} color="success">{detail ?? 'Ready'}</Tag>,
        loading: <Tag icon={<LoadingOutlined spin />} color="processing">{detail ?? 'Checking...'}</Tag>,
        error: <Tag icon={<CloseCircleFilled />} color="error">{detail ?? 'Failed'}</Tag>,
        waiting: <Tag icon={<ClockCircleOutlined />} color="default">{detail ?? 'Waiting'}</Tag>
    }[status]);
}

/**
 * Check row component
 */
const CheckRow: React.FC<{ item: CheckItem }> = ({ item }) => {
    return (
        <Row gutter={[12, 8]} align="middle" className={`loading-item loading-item--${item.status}`}>
            <Col><div className="loading-item-icon">{item.icon}</div></Col>
            <Col flex="auto" className="loading-item-text">
                <Typography.Text strong className="loading-item-title">{item.title}</Typography.Text>
                <Typography.Text type="secondary" className="loading-item-desc">{item.description}</Typography.Text>
                {item.meta && <Typography.Text type="secondary" className="loading-item-meta">{item.meta}</Typography.Text>}
            </Col>
            <Col>
                <StatusTag status={item.status} detail={item.detail} />
            </Col>
        </Row>
    )
}

const CheckingPage: React.FC = () => {
    /**
    * Hook
    */
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    /**
     * State management
     */
    const [attempt, setAttempt] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<CheckItem[]>(ITEMS);
    const setItem = (key: string, patch: Partial<CheckItem>) => {
        setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
    }

    const fail = (key: string, message: string) => {
        setItem(key, { status: 'error', detail: message });
        setError(message);
    }

    const retry = () => {
        setError(null);
        window.electronAPI.backend.retryInstall()
        setAttempt(prev => prev + 1);
    }

    const done = items.filter((i) => i.status === 'success').length;
    const percent = done / items.length * 100;

    useEffect(() => {
        (async () => {
            // Phase 1: Check Python Runtime
            setItems(ITEMS);
            const deadline = Date.now() + DEADLINE_MS;
            while (true) {
                const checkRuntime = await window.electronAPI.backend.status();
                if (checkRuntime.phase === 'ready') {
                    setItem('runtime', { status: 'success', detail: 'ready' });
                    break;
                }

                if (checkRuntime.phase === 'error') {
                    return fail('runtime', checkRuntime.message ?? 'Python runtime failed to start');
                }

                if (Date.now() > deadline) {
                    return fail('runtime', 'Python runtime start timeout');
                }
                await sleep(POLL_MS);
            }

            // Phase 2: Start Backend
            setItem('backend', { status: 'loading', detail: 'Starting backend...' });
            try {
                await window.electronAPI.backend.start();
            } catch (e:any) {
                return fail('backend', e.message || 'Backend start failed');
            }
            for (let i = 0; i < BACKEND_TRIES; i++) {
                await sleep(1000);
                try {
                    const checkBackend = await dispatch(requestStartBackendThunk(null)).unwrap();
                    if (checkBackend.startBackendStatus?.status === 'success') {
                        setItem('backend', { status: 'success', detail: 'ready' });
                        setTimeout(() => navigate('/translate', { replace: true }), 3000);
                        return;
                    }
                } catch { }
            }
            fail('backend', 'Backend start timeout');
        })();
    }, [attempt]);

    return (
        <Row justify="center" className="loading-page">
            <Col xs={24} sm={22} md={16} lg={12} xl={10}>
                <Card className="loading-card">
                    {/* ===== Header ===== */}
                    <Space orientation="vertical" align="center" size={4} className="loading-header">
                        <LoadingOutlined spin style={{ fontSize: 42 }} className="loading-spinner" />
                        <Typography.Title level={3} className="loading-title">
                            Starting ElecTranslator
                        </Typography.Title>
                        <Typography.Text type="secondary" className="loading-subtitle">
                            Starting embedded runtime &amp; backend service. Please keep the app open...
                        </Typography.Text>
                    </Space>

                    {/* ===== Overall progress ===== */}
                    <Progress
                        percent={percent}
                        status={percent === 100 ? 'success' : 'active'}
                        className="loading-progress"
                    />

                    {/* ===== Startup checks ===== */}
                    <Divider plain className="loading-divider">
                        Startup checks
                    </Divider>

                    <Space orientation="vertical" size={12} className="loading-list">
                        {items.map((item) => (
                            <CheckRow key={item.key} item={item} />
                        ))}
                    </Space>

                    {error && (
                        <Alert type="error" showIcon title={error} style={{ marginTop: 12 }} action={<Button size="small" onClick={retry}>Retry</Button>} />
                    )}

                    {/* ===== Footer note ===== */}
                    <Typography.Text type="secondary" italic className="loading-footer">
                        Translation is powered by your configured AI provider (Claude, OpenAI, Google or Custom endpoint).
                    </Typography.Text>
                </Card>
            </Col>
        </Row>
    );
};

export default CheckingPage;