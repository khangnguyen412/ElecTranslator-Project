/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redux
 */
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import { requestOllamaCheckThunk, requestPythonCheckThunk, requestPythonLibraryCheckThunk } from '@/redux/features/healthCheck';

/**
 * Ant Design
 */
import { Progress, Result, Button, Alert, Tag, Steps, Typography, Space, Divider, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, WarningOutlined, RocketOutlined, PythonOutlined, ApiOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';

/**
 * Styles
 */
import "@/assets/scss/loading.scss";

/**
 * Type
 */
import type { pythonStatus, pythonLibStatus, ollamaStatus } from "@/types/heathCheck.type";

const { Text } = Typography;

type NotifiComponentProps = {
    scenario: 'fallback' | 'error';
    getStatusIcon: (status: pythonStatus | pythonLibStatus) => React.ReactNode;
    runSequentialChecks: () => void;
}
const NotificationComponent: React.FC<NotifiComponentProps> = ({ scenario, getStatusIcon, runSequentialChecks }) => {
    const navigate = useNavigate();

    const pythonStatusState = useSelector((state: RootState) => state.healthCheck.pythonStatus);
    const pythonLibraryStatusState = useSelector((state: RootState) => state.healthCheck.pythonLibraryStatus);
    const ollamaStatusState = useSelector((state: RootState) => state.healthCheck.ollamaStatus);

    useEffect(() => {
        console.log(pythonStatusState, pythonLibraryStatusState, ollamaStatusState);
    }, []);

    const resultConfig = {
        icon: scenario === 'fallback' ? <WarningOutlined style={{ color: '#faad14', fontSize: 72 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 72 }} />,
        title: (
            <Space>
                {scenario === 'fallback' ? (
                    <span style={{ color: '#faad14' }}>Limited Mode Available</span>
                ) : (
                    <span style={{ color: '#ff4d4f' }}>Error Detected</span>
                )}
            </Space>
        ),
        subTitle: (
            <div style={{ textAlign: 'left', maxWidth: 450, margin: '0 auto' }}>
                <Alert type="info" title="System Check Results" style={{ marginTop: 16 }} description={
                    <Space orientation="vertical" size="small" style={{ width: '100%', marginTop: 8 }}>
                        <Space>
                            {getStatusIcon({ status: pythonStatusState?.status || 'missing' })}
                            <Text strong>Python version 3.11:</Text>
                            {pythonStatusState?.status === 'success' ? (
                                <Text type="success">{pythonStatusState?.message}</Text>
                            ) : (
                                <Text type="danger">{pythonStatusState?.message}</Text>
                            )}
                        </Space>
                        <Space align="start">
                            {getStatusIcon({ status: pythonLibraryStatusState?.status || 'missing' })}
                            <Text strong>Libraries: </Text>
                            {pythonLibraryStatusState?.status !== 'idle' ? (
                                <React.Fragment>
                                    {pythonLibraryStatusState?.missing?.length || 0 > 0 ? (
                                        <div>
                                            <Text type="danger">Missing: </Text>
                                            {pythonLibraryStatusState?.missing?.map((lib: string) => (
                                                <Tag color="red" key={lib}>{lib}</Tag>
                                            ))}
                                        </div>
                                    ) : (
                                        <Text type="success">All required libraries installed</Text>
                                    )}
                                </React.Fragment>
                            ) : (
                                <Text>Waiting for libraries</Text>
                            )}

                        </Space>
                        <Space>
                            {getStatusIcon({ status: ollamaStatusState?.status || 'missing' })}
                            <Text strong>Ollama: </Text>
                            {ollamaStatusState?.status !== 'idle' ? (
                                <React.Fragment>
                                    {ollamaStatusState?.status !== 'error' ? (
                                        <Text type="success">Running</Text>
                                    ) : (
                                        <Text type="danger">{ollamaStatusState?.message}</Text>
                                    )}
                                </React.Fragment>
                            ) : (
                                <Text>Waiting for Ollama</Text>
                            )}
                        </Space>
                    </Space>
                } />
                <Divider style={{ margin: '16px 0', borderColor: '#fff' }} />
                <div style={{ background: 'rgba(24,144,255,0.1)', padding: 12, borderRadius: 8 }}>
                    <Text strong style={{ color: '#1890ff' }}>📋 What works in this mode:</Text>
                    <ul style={{ margin: '8px 0 0 20px', color: '#ffffffd9' }}>
                        <li>Screen capture & OCR text extraction</li>
                        <li>Text display in translation panel</li>
                        <li>Copy to clipboard functionality</li>
                    </ul>
                    <Text type="secondary" style={{ display: 'block', marginTop: 8, color: '#ffffffd9' }}>
                        AI translation via Gemma3 will be disabled
                    </Text>
                </div>
            </div>
        ),
        extra: (
            <React.Fragment>
                <Space wrap orientation="vertical">
                    {scenario == 'fallback' && (
                        <Button key="continue" type="primary" size="large" onClick={() => { navigate('/translate', { state: { defaultTranslate: true } }); }} icon={<RocketOutlined />} style={{ width: '100%' }}                        >
                            Continue with default translate
                        </Button>
                    )}
                    <Button key="retry" size="large" onClick={() => { runSequentialChecks() }} icon={<ReloadOutlined />} style={{ width: '100%' }}                        >
                        Retry System Check
                    </Button>
                    <Button key="retry" size="large" onClick={() => { }} icon={<QuestionCircleOutlined />} style={{ width: '100%' }}                        >
                        How to fix
                    </Button>
                </Space>
            </React.Fragment>
        )
    }

    return (
        <div className="flex-loading flex-col flex-col-fixed">
            <Result status="warning" style={{ padding: '24px' }} {...resultConfig} />
        </div>
    );

}

const LoadingPage: React.FC = () => {
    /**
    * Hook
    */
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const pythonStatusState = useSelector((state: RootState) => state.healthCheck.pythonStatus);
    const pythonLibraryStatusState = useSelector((state: RootState) => state.healthCheck.pythonLibraryStatus);
    const ollamaStatusState = useSelector((state: RootState) => state.healthCheck.ollamaStatus);

    /**
     * State management
     */
    const [ollamaStatus, setOllamaStatus] = useState<ollamaStatus>({ status: 'idle' });
    const [pythonStatus, setPythonStatus] = useState<pythonStatus>({ status: 'idle' });
    const [pythonLibraryStatus, setPythonLibraryStatus] = useState<pythonLibStatus>({ status: 'idle' });
    const [scenario, setScenario] = useState<'idle' | 'success' | 'fallback' | 'error'>('idle');

    const isAllReady = useMemo(() => ollamaStatus?.status === 'success' && pythonStatus?.status === 'success' && pythonLibraryStatus?.status === 'success',
        [ollamaStatus, pythonStatus, pythonLibraryStatus]);

    /**
     * Sequential checks
     */
    const runSequentialChecks = async () => {
        setScenario('idle');
        setPythonStatus({ status: 'idle' });
        setPythonLibraryStatus({ status: 'idle' });
        setOllamaStatus({ status: 'idle' });
        try {
            // Step 1: Python Environment
            const pythonResult = await dispatch(requestPythonCheckThunk(null)).unwrap();
            setPythonStatus(pythonResult.pythonStatus || {});
            if (pythonResult.pythonStatus?.status === 'error') {
                setTimeout(() => {
                    setScenario('error');
                }, 3000);
                return;
            }

            // Step 2: Python Library
            const libResult = await dispatch(requestPythonLibraryCheckThunk(null)).unwrap();
            setPythonLibraryStatus(libResult.pythonLibraryStatus || {});
            if (libResult.pythonLibraryStatus?.status === 'error') {
                setTimeout(() => {
                    setScenario('error');
                }, 3000);
                return;
            }

            // Step 3: Ollama API
            const ollamaResult = await dispatch(requestOllamaCheckThunk(null)).unwrap();
            setOllamaStatus(ollamaResult?.ollamaStatus || {});

            // Step 4: All checks passed
            setScenario('success');
            setTimeout(() => {
                navigate('/translate');
            }, 3000);
        } catch (error) {
            // Handle error: Handle fallback or error
            setTimeout(() => {
                setScenario('fallback');
            }, 3000);
        }
    };

    /**
     * Get completion step based on status
     */
    const getCompletionStep = () => {
        let step = 0;
        if (pythonStatus.status && pythonStatus.status !== 'idle') step++;
        if (pythonLibraryStatus.status && pythonLibraryStatus.status !== 'idle') step++;
        if (ollamaStatus.status && ollamaStatus.status !== 'idle') step++;
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

    const progressConfig = {
        percent: scenario === 'idle' ? Math.min(getCompletionStep() * (100 / 3), 100) : 100,
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
    }, [dispatch]);

    /**
     * Update status based on state changes
     */
    useEffect(() => {
        if (ollamaStatusState?.status === 'error') {
            setOllamaStatus({ status: 'error' });
        }
        if (pythonStatusState?.status === 'error') {
            setPythonStatus({ status: 'error' });
        }
        if (pythonLibraryStatusState?.status === 'error') {
            setPythonLibraryStatus({ status: 'error' });
        }
    }, [ollamaStatusState, pythonStatusState, pythonLibraryStatusState]);

    /**
     * If fallback scenario, render fallback component
     */
    if (scenario === 'fallback') {
        return <NotificationComponent scenario={scenario} getStatusIcon={(status) => getStatusIcon(status.status)} runSequentialChecks={runSequentialChecks} />;
    }

    if (scenario === 'error') {
        return <NotificationComponent scenario={scenario} getStatusIcon={(status) => getStatusIcon(status.status)} runSequentialChecks={runSequentialChecks} />;
    }

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

export default LoadingPage;