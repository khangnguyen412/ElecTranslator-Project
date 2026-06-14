/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestPythonCheckThunk, requestPythonLibraryCheckThunk, requestOllamaCheckThunk } from '@/redux/features/check';
import { requestStartBackendThunk } from '@/redux/features/start';

/**
 * Ant Design
 */
import { Progress, Tag, Steps, Typography, Space, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, PythonOutlined, ApiOutlined, } from '@ant-design/icons';

/**
 * Styles
 */
import "@/assets/scss/loading.scss";

/**
 * Type
 */
import type { pythonStatus, pythonLibStatus, ollamaStatus, startBackend } from "@/types/check.type";

const { Text } = Typography;

const CheckingPage: React.FC = () => {
    /**
    * Hook
    */
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    /**
     * State management
     */
    const [pythonStatus, setPythonStatus] = useState<pythonStatus>({ status: 'idle' });
    const [pythonLibraryStatus, setPythonLibraryStatus] = useState<pythonLibStatus>({ status: 'idle' });
    const [startBackendStatus, setStartBackendStatus] = useState<startBackend>({ status: 'idle' });
    const [ollamaStatus, setOllamaStatus] = useState<ollamaStatus>({ status: 'idle' });
    const [scenario, setScenario] = useState<'idle' | 'success' | 'fallback' | 'error'>('idle');

    const isAllReady = useMemo(() =>
        ollamaStatus?.status === 'success' &&
        pythonStatus?.status === 'success' &&
        pythonLibraryStatus?.status === 'success' &&
        startBackendStatus?.status === 'success',
        [ollamaStatus, pythonStatus, pythonLibraryStatus, startBackendStatus]);

    /**
     * Sequential checks
     */
    const runSequentialChecks = async () => {
        setScenario('idle');
        setPythonStatus({ status: 'idle' });
        setPythonLibraryStatus({ status: 'idle' });
        setStartBackendStatus({ status: 'idle' });
        setOllamaStatus({ status: 'idle' });
        try {
            // Step 1: Python Environment
            try {
                const pythonResult = await dispatch(requestPythonCheckThunk(null)).unwrap();
                setPythonStatus({
                    status: 'success',
                    version: pythonResult.pythonStatus?.version || '',
                    message: pythonResult.pythonStatus?.message || ''
                });
            }
            catch (e) {
                setPythonStatus({ status: 'error' });
                setTimeout(() => {
                    setScenario('error');
                }, 3000);
                throw e;
            }

            // Step 2: Python Library
            try {
                const libResult = await dispatch(requestPythonLibraryCheckThunk(null)).unwrap();
                setPythonLibraryStatus({
                    status: 'success',
                    installed: libResult.pythonLibraryStatus?.installed || [],
                    missing: libResult.pythonLibraryStatus?.missing || [],
                    message: libResult.pythonLibraryStatus?.message || ''
                });
            } catch (e) {
                setPythonLibraryStatus({ status: 'error', });
                setTimeout(() => {
                    setScenario('error');
                }, 3000);
                throw e;
            }

            // Step 3: Start Backend
            await window.electronAPI.startBackend();
            for (let i = 0; i < 15; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
                try {
                    const check = await dispatch(requestStartBackendThunk(null)).unwrap();
                    if (check.startBackendStatus?.status === 'success') {
                        setStartBackendStatus(check.startBackendStatus);
                        break; // Exit loop if backend is ready
                    } else {
                        setStartBackendStatus({ status: 'error' });
                    }
                } catch (e) {
                    console.log(`Waiting for backend...`);
                }
            }

            // Step 4: Ollama API
            try {
                await dispatch(requestOllamaCheckThunk(null)).unwrap();
                setOllamaStatus({ status: 'success' });
            } catch (e) {
                setOllamaStatus({ status: 'error' });
                setTimeout(() => {
                    setScenario('fallback');
                }, 3000);
                throw e;
            }

            // Step 5: All checks passed
            setScenario('success');
            setTimeout(() => {
                navigate('/translate');
            }, 3000);
        } catch (error) {
            setTimeout(() => {
                navigate('/fallback');
            }, 3000);
        }
    };

    /**
     * Get completion step based on status
     */
    const getCompletionStep = () => {
        let step = 0;
        if (pythonStatus.status === 'success') step++;
        if (pythonLibraryStatus.status === 'success') step++;
        if (startBackendStatus.status === 'success') step++;
        if (ollamaStatus.status === 'success') step++;
        return step;
    }

    /**
     * Get status icon based on status
     */
    const getStatusIcon = (status: string, size: number = 20) => {
        const style = { fontSize: size };
        switch (status) {
            case 'success':
                return <CheckCircleOutlined style={{ ...style, color: '#52c41a' }} />;
            case 'error':
                return <CloseCircleOutlined style={{ ...style, color: '#ff4d4f' }} />;
            case 'timeout':
                return <CloseCircleOutlined style={{ ...style, color: '#faad14' }} />;
            default:
                return <LoadingOutlined spin style={{ ...style, color: '#1890ff' }} />;
        }
    };

    /**
     * Step configuration
     */
    const stepConfig = {
        orientation: 'vertical' as const,
        current: getCompletionStep(),
        style: { backgroundColor: 'transparent' },
        items: [
            {
                title: (
                    <Space>
                        <PythonOutlined /> Python Environment <Tag color="blue">version 3.11</Tag>
                    </Space>
                ),
                description: (
                    <Space orientation="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: 12, color: '#ffffffa6' }}>
                            {pythonStatus?.message}
                        </Text>
                    </Space>
                ),
                icon: getStatusIcon(pythonStatus?.status || 'idle'),
            },
            {
                title: (
                    <Space>
                        <PythonOutlined /> Python Library
                    </Space>
                ),
                description: (
                    <Space orientation="vertical" size={0}>
                        {pythonLibraryStatus?.status === 'idle' && (
                            <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                                <Tag color="blue" style={{ fontSize: 10 }}>Checking...</Tag>
                            </Space>
                        )}
                        {pythonLibraryStatus?.status === 'success' && (
                            <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                                Installated: {pythonLibraryStatus?.installed?.map((item) => (<Tag key={item} color="green" style={{ fontSize: 10 }}>{item}</Tag>)) || 'None'}
                            </Space>
                        )}
                        {pythonLibraryStatus?.status === 'missing' && (
                            <React.Fragment>
                                <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                                    Installated: {pythonLibraryStatus?.installed?.map((item) => (<Tag key={item} color="green" style={{ fontSize: 10 }}>{item}</Tag>)) || 'None'}
                                </Space>
                                <Space wrap style={{ fontSize: 12, color: '#ffffffa6' }}>
                                    Missing: {pythonLibraryStatus?.missing?.map((item) => (<Tag key={item} color="red" style={{ fontSize: 10 }}>{item}</Tag>)) || 'None'}
                                </Space>
                            </React.Fragment>
                        )}
                    </Space>
                ),
                icon: getStatusIcon(pythonLibraryStatus?.status || 'loading'),
            },
            {
                title: (
                    <Space>
                        <ApiOutlined /> Backend API
                    </Space>
                ),
                description: (
                    <Row gutter={8}>
                        <Col>
                            <Text type="secondary" style={{ fontSize: 12, color: '#ffffffa6' }}>
                                Status:
                            </Text>
                        </Col>
                        <Col>
                            {startBackendStatus?.status === 'idle' && <Tag color="blue" style={{ fontSize: 10 }}>Checking...</Tag>}
                            {startBackendStatus?.status === 'success' && <Tag color="green" style={{ fontSize: 10 }}>Ready</Tag>}
                            {startBackendStatus?.status === 'error' && <Tag color="red" style={{ fontSize: 10 }}>Unavailable</Tag>}
                        </Col>
                    </Row>
                ),
                icon: getStatusIcon(startBackendStatus?.status || 'loading'),
            },
            {
                title: (
                    <Space>
                        <ApiOutlined /> Ollama API
                    </Space>
                ),
                description: (
                    <Row gutter={8}>
                        <Col>
                            <Text type="secondary" style={{ fontSize: 12, color: '#ffffffa6' }}>
                                Status:
                            </Text>
                        </Col>
                        <Col>
                            {ollamaStatus?.status === 'idle' && <Tag color="blue" style={{ fontSize: 10 }}>Checking...</Tag>}
                            {ollamaStatus?.status === 'success' && <Tag color="green" style={{ fontSize: 10 }}>Ready</Tag>}
                            {ollamaStatus?.status === 'error' && <Tag color="red" style={{ fontSize: 10 }}>Unavailable</Tag>}
                        </Col>
                    </Row>
                ),
                icon: getStatusIcon(ollamaStatus?.status || 'loading'),
            },
        ],
    }

    /**
     * Progress bar configuration
     */
    const progressConfig = {
        percent: scenario === 'idle' ? Math.min(getCompletionStep() * (100 / 4), 100) : 100,
        format: (percent: any) => {
            if (scenario === 'idle') return (<span style={{ color: '#ffffff' }}>{Math.round(percent || 0)}%</span>);
            return isAllReady && '✅ All Systems Ready';
        },
        strokeColor: { '0%': '#108ee9', '50%': '#00d4ff', '100%': isAllReady ? '#52c41a' : '#faad14' },
    }

    /**
     * Run sequential checks
     */
    useEffect(() => {
        runSequentialChecks();
    }, []);

    return (
        <div className="flex-loading flex-col flex-col-fixed">
            <div className="loading-container">
                {/* Header */}
                <div className="loading-header">
                    <div className="logo-animation">
                        <div className="loader">
                            <div className="inner one"></div>
                            <div className="inner two"></div>
                            <div className="inner three"></div>
                        </div>
                    </div>
                    <Typography.Title level={3} style={{ color: '#fff', margin: '16px 0 8px' }}>
                        ElecTranslator
                    </Typography.Title>
                    <Text type="secondary">Checking translation engine...</Text>
                </div>

                {/* Progress Steps */}
                <div className="check-section">
                    <Steps {...stepConfig} />
                </div>

                {/* Overall Progress Bar */}
                <div className="progress-section">
                    <Progress {...progressConfig} />
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4, color: '#ffffffa6' }}>
                        {scenario === 'idle' ? 'Please wait, checking system requirements...' : isAllReady ? '🚀 Ready to translate!' : '🔧 Some features limited - see details above'}
                    </Text>
                </div>

                {/* Auto-continue hint */}
                {scenario !== 'idle' && (
                    <div className="auto-continue-hint">
                        <Text type="secondary" style={{ fontSize: 12, color: '#ffffffa6' }}>
                            Auto-continuing in <strong>3</strong> seconds...
                        </Text>
                    </div>
                )}
            </div>

            {/* Background decoration */}
            <div className="loading-bg-decoration">
                <div className="pulse-ring"></div>
                <div className="pulse-ring delay-1"></div>
                <div className="pulse-ring delay-2"></div>
            </div>
        </div>
    );
};

export default CheckingPage;