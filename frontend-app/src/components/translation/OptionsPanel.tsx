/* eslint-disable */
import React from 'react';

/**
 * Ant Design
 */
import { Row, Col, Select, Typography, Space, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';

/**
 * Change Case
 */
import { sentenceCase } from 'change-case';

/**
 * Config
 */
import { getLangNameByLang } from '@/config/language.config';

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
            <div className="options-panel-card">
                <Typography.Text strong className="options-panel-card__title">
                    <SettingOutlined className="options-panel-title-icon" /> Translation Settings
                </Typography.Text>

                <Row gutter={[16, 16]}>
                    {/* Current Status */}
                    <Col xs={24}>
                        <Typography.Text strong className="options-panel-label">Status</Typography.Text>
                        <div className="options-panel-card__status-box">
                            <Typography.Text strong>Mode: {mode}</Typography.Text>
                            <Typography.Text strong>Category: {sentenceCase(category || "")}</Typography.Text>
                            <Typography.Text strong>Source Language: {getLangNameByLang(sourceConfig.value || "")?.langName}</Typography.Text>
                            <Typography.Text strong>Target Language: {getLangNameByLang(targetConfig.value || "")?.langName}</Typography.Text>
                        </div>
                    </Col>
                    <Col xs={24}>
                        <Typography.Text strong className="options-panel-label">Translation Mode</Typography.Text>
                        <Select
                            value={modeConfig.value}
                            onChange={(v) => { console.log('mode onChange', v); if (modeConfig.onChange) modeConfig.onChange(v); }}
                            options={modeConfig.options || []}
                            placeholder={modeConfig.placeholder}
                            style={modeConfig.style}>
                        </Select>
                    </Col>
                    {isAI && (
                        <Col xs={24}>
                            <Typography.Text strong className="options-panel-label">Model</Typography.Text>
                            <Select
                                value={modelConfig.value}
                                onChange={modelConfig.onChange || undefined}
                                options={modelConfig.options || []}
                                placeholder={modelConfig.placeholder}
                                style={modelConfig.style}>
                            </Select>
                        </Col>
                    )}
                    <Col xs={24}>
                        <Typography.Text strong className="options-panel-label">Source Language</Typography.Text>
                        <Select
                            value={sourceConfig.value}
                            onChange={(v) => { if (sourceConfig.onChange) sourceConfig.onChange(v); }}
                            options={sourceConfig.options || []}
                            placeholder={sourceConfig.placeholder}
                            style={sourceConfig.style}>
                        </Select>
                    </Col>
                    <Col xs={24}>
                        <Typography.Text strong className="options-panel-label">Target Language</Typography.Text>
                        <Select
                            value={targetConfig.value}
                            onChange={(v) => { if (targetConfig.onChange) targetConfig.onChange(v); }}
                            options={targetConfig.options || []}
                            placeholder={targetConfig.placeholder}
                            style={targetConfig.style}>
                        </Select>
                    </Col>
                    {isAI && (
                        <Col xs={24}>
                            <Typography.Text strong className="options-panel-label">Category</Typography.Text>
                            <Select
                                value={categoryConfig.value}
                                onChange={(v) => { if (categoryConfig.onChange) categoryConfig.onChange(v); }}
                                options={categoryConfig.options || []}
                                placeholder={categoryConfig.placeholder}
                                style={categoryConfig.style}>
                            </Select>
                        </Col>
                    )}
                    {/* Show Comic Genre when Category is Comic / Manga */}
                    {showTone && (
                        <Col xs={24}>
                            <Typography.Text strong className="options-panel-label">Comic Genre</Typography.Text>
                            <Select
                                value={toneConfig.value}
                                onChange={toneConfig.onChange || undefined}
                                options={toneConfig.options || []}
                                placeholder={toneConfig.placeholder}
                                style={toneConfig.style}>
                            </Select>
                        </Col>
                    )}
                    <Col xs={24}>
                        <Button icon={<SettingOutlined />} onClick={onOpenAdvancedSettings} className="options-panel-advanced-btn" >
                            Advanced Settings
                        </Button>
                    </Col>
                </Row>
            </div>
        </Space>
    )
}