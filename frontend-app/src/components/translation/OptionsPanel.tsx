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
        <Space wrap={true}>
            {/* Translation Settings */}
            <div style={{ background: '#A3A6D8', padding: 16, borderRadius: 20, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                <Typography.Text strong style={{ marginBottom: 12, color: '#fff' }}>
                    <SettingOutlined style={{ marginRight: 6 }} /> Translation Settings
                </Typography.Text>

                <Row gutter={[16, 16]}>
                    {/* Current Status */}
                    <Col xs={24}>
                        <Typography.Text strong style={{ color: '#fff' }}>Status</Typography.Text>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 8, marginTop: 4, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8 }}>

                        </div>
                    </Col>
                    <Col xs={24}>
                        <Typography.Text strong style={{ color: '#fff' }}>Translation Mode</Typography.Text>
                        <Select 
                            value={modeConfig.value} 
                            onChange={(v) => { console.log('mode onChange', v); if (modeConfig.onChange) modeConfig.onChange(v); }}
                            options={modeConfig.options || []} 
                            placeholder={modeConfig.placeholder} 
                            style={modeConfig.style}
                        />
                    </Col>
                    {isAI && (
                        <Col xs={24}>
                            <Typography.Text strong style={{ color: '#fff' }}>Model</Typography.Text>
                            <Select 
                                value={modelConfig.value} 
                                onChange={modelConfig.onChange || undefined}
                                options={modelConfig.options || []} 
                                placeholder={modelConfig.placeholder} 
                                style={modelConfig.style}
                            />
                        </Col>
                    )}
                    <Col xs={24}>
                        <Typography.Text strong style={{ color: '#fff' }}>Source Language</Typography.Text>
                        <Select 
                            value={sourceConfig.value} 
                            onChange={(v) => { if (sourceConfig.onChange) sourceConfig.onChange(v); }}
                            options={sourceConfig.options || []} 
                            placeholder={sourceConfig.placeholder} 
                            style={sourceConfig.style}
                        />
                    </Col>
                    <Col xs={24}>
                        <Typography.Text strong style={{ color: '#fff' }}>Target Language</Typography.Text>
                        <Select 
                            value={targetConfig.value} 
                            onChange={(v) => { if (targetConfig.onChange) targetConfig.onChange(v); }}
                            options={targetConfig.options || []} 
                            placeholder={targetConfig.placeholder} 
                            style={targetConfig.style}
                        />
                    </Col>
                    {isAI && (
                        <Col xs={24}>
                            <Typography.Text strong style={{ color: '#fff' }}>Category</Typography.Text>
                            <Select 
                                value={categoryConfig.value} 
                                onChange={(v) => { if (categoryConfig.onChange) categoryConfig.onChange(v); }}
                                options={categoryConfig.options || []} 
                                placeholder={categoryConfig.placeholder} 
                                style={categoryConfig.style}
                            />
                        </Col>
                    )}
                    {/* Show Comic Genre when Category is Comic / Manga */}
                    {showTone && (
                        <Col xs={24}>
                            <Typography.Text strong style={{ color: '#fff' }}>Comic Genre</Typography.Text>
                            <Select 
                                value={toneConfig.value} 
                                onChange={toneConfig.onChange || undefined}
                                options={toneConfig.options || []} 
                                placeholder={toneConfig.placeholder} 
                                style={toneConfig.style}
                            />
                        </Col>
                    )}
                </Row>
            </div>
            <Button type="text" icon={<SettingOutlined />} onClick={onOpenAdvancedSettings} style={{ marginBottom: 12, color: '#fff' }} >
                Advanced Settings
            </Button>
        </Space>
    )
}