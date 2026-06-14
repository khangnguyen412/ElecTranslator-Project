/* eslint-disable */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Redux
 */
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';

/**
 * Ant Design
 */
import { Result, Button, Alert, Tag, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, WarningOutlined, RocketOutlined, ReloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';

/**
 * Styles
 */
import "@/assets/scss/loading.scss";

const { Text } = Typography;

const FallbackPage: React.FC<{ scenario: 'fallback' | 'error'; }> = ({ scenario }) => {
    const navigate = useNavigate();

    const pythonStatusState = useSelector((state: RootState) => state.check.pythonStatus);
    const pythonLibraryStatusState = useSelector((state: RootState) => state.check.pythonLibraryStatus);
    const startBackendStatusState = useSelector((state: RootState) => state.start.startBackend);
    const ollamaStatusState = useSelector((state: RootState) => state.check.ollamaStatus);

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
                            {getStatusIcon(pythonStatusState?.status || 'missing')}
                            <Text strong>Python version 3.11:</Text>
                            {pythonStatusState?.status === 'success' ? (
                                <Text type="success">{pythonStatusState?.message}</Text>
                            ) : (
                                <Text type="danger">{pythonStatusState?.message}</Text>
                            )}
                        </Space>
                        <Space align="start">
                            {getStatusIcon(pythonLibraryStatusState?.status || 'missing')}
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
                        <Space align="start">
                            {getStatusIcon(startBackendStatusState?.status || 'missing')}
                            <Text strong>Backend: </Text>
                            {startBackendStatusState?.status !== 'idle' ? (
                                <React.Fragment>
                                    {startBackendStatusState?.status !== 'error' ? (
                                        <Text type="success">Running</Text>
                                    ) : (
                                        <Text type="danger">{startBackendStatusState?.message}</Text>
                                    )}
                                </React.Fragment>
                            ) : (
                                <Text>Waiting for Backend</Text>
                            )}
                        </Space>
                        <Space>
                            {getStatusIcon(ollamaStatusState?.status || 'missing')}
                            <Text strong>Ollama: </Text>
                            {ollamaStatusState?.status !== 'idle' ? (
                                <React.Fragment>
                                    {ollamaStatusState?.status !== 'error' ? (
                                        <Text type="success">Running</Text>
                                    ) : (
                                        <Text type="danger">Ollama not running</Text>
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
                <Space wrap orientation="vertical" style={{ width: '100%' }}>
                    {scenario == 'fallback' && (
                        <Button key="continue" type="primary" size="large" onClick={() => { navigate('/translate', { state: { defaultTranslate: true } }); }} icon={<RocketOutlined />} style={{ width: '100%' }}                        >
                            Continue with default translate
                        </Button>
                    )}
                    <Button key="retry" size="large" onClick={() => { navigate('/'); }} icon={<ReloadOutlined />} style={{ width: '100%' }}                        >
                        Retry System Check
                    </Button>
                    <Button key="how-to-fix" type="primary" size="large" onClick={() => { }} icon={<QuestionCircleOutlined />} style={{ width: '100%' }}                        >
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

export default FallbackPage;
