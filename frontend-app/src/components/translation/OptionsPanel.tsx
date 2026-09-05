/* eslint-disable */
import React from 'react';

/**
 * Ant Design
 */
import { Row, Col, Select, Typography, Space, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';

/**
 * Type
 */
interface OptionsPanelProps {
    mode: string | undefined;
    category: string | undefined;
    modeConfig: SelectProps<any>;
    modelConfig: SelectProps<any>;
    sourceConfig: SelectProps<any>;
    targetConfig: SelectProps<any>;
    categoryConfig: SelectProps<any>;
    toneConfig: SelectProps<any>;
    onOpenAdvancedSettings: () => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ mode, category, modeConfig, modelConfig, sourceConfig, targetConfig, categoryConfig, toneConfig, onOpenAdvancedSettings }) => {
    const isAI = ["AI"].includes(mode || "");
    const showTone = isAI && ["comic", "novel"].includes(category || "");

    return (
        <Col span={24} md={{ span: 6, order: 2 }} xs={{ order: 1 }}>
            <Space wrap={true}>
                {/* Translation Settings */}
                <div style={{ background: '#A3A6D8', padding: 16, borderRadius: 20, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                    <Typography.Text strong style={{ marginBottom: 12, color: '#fff' }}>
                        <SettingOutlined style={{ marginRight: 6 }} /> Translation Settings
                    </Typography.Text>

                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <Typography.Text strong style={{ color: '#fff' }}>Translation Mode</Typography.Text>
                            <Select {...modeConfig} />
                        </Col>
                        {isAI && (
                            <Col xs={24}>
                                <Typography.Text strong style={{ color: '#fff' }}>Model</Typography.Text>
                                <Select {...modelConfig} />
                            </Col>
                        )}
                        <Col xs={24}>
                            <Typography.Text strong style={{ color: '#fff' }}>Source Language</Typography.Text>
                            <Select {...sourceConfig} />
                        </Col>
                        <Col xs={24}>
                            <Typography.Text strong style={{ color: '#fff' }}>Target Language</Typography.Text>
                            <Select {...targetConfig} />
                        </Col>
                        {isAI && (
                            <Col xs={24}>
                                <Typography.Text strong style={{ color: '#fff' }}>Category</Typography.Text>
                                <Select {...categoryConfig} />
                            </Col>
                        )}
                        {/* Show Comic Genre when Category is Comic / Manga */}
                        {showTone && (
                            <Col xs={24}>
                                <Typography.Text strong style={{ color: '#fff' }}>Comic Genre</Typography.Text>
                                <Select {...toneConfig} />
                            </Col>
                        )}
                    </Row>
                </div>
                <Button type="text" icon={<SettingOutlined />} onClick={onOpenAdvancedSettings} style={{ marginBottom: 12, color: '#fff' }} >
                    Advanced Settings
                </Button>
            </Space>
        </Col>
    )
}