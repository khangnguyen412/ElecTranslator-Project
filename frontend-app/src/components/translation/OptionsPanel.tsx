/* eslint-disable */
import React from 'react';

/**
 * Ant Design
 */
import { Row, Col, Select, Typography, Card, Descriptions } from 'antd';
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
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ mode, category, modeConfig, modelConfig, sourceConfig, targetConfig, categoryConfig, toneConfig }) => {
    const isAI = ["AI"].includes(mode || "");
    const showTone = isAI && ["comic", "novel"].includes(category || "");

    return (
        <Card title="Translation Settings" className="options-panel-sticky">
            {/* Translation Settings */}
            <Row gutter={[16, 16]}>
                {/* Current Status */}
                <Col xs={24}>
                    <Typography.Text strong>Status</Typography.Text>
                    <Descriptions
                        size="small" bordered column={1} className="options-panel-status"
                        items={[
                            { key: 'mode', label: 'Mode', children: mode },
                            { key: 'cat', label: 'Category', children: sentenceCase(category || "") },
                            { key: 'src', label: 'Source Language', children: getLangNameByLang(sourceConfig.value || "")?.langName },
                            { key: 'tgt', label: 'Target Language', children: getLangNameByLang(targetConfig.value || "")?.langName },
                        ]}
                    />
                </Col>
                <Col xs={24}>
                    <Typography.Text strong>Translation Mode</Typography.Text>
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
                        <Typography.Text strong>Model</Typography.Text>
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
                    <Typography.Text strong>Source Language</Typography.Text>
                    <Select
                        value={sourceConfig.value}
                        onChange={(v) => { if (sourceConfig.onChange) sourceConfig.onChange(v); }}
                        options={sourceConfig.options || []}
                        placeholder={sourceConfig.placeholder}
                        style={sourceConfig.style}>
                    </Select>
                </Col>
                <Col xs={24}>
                    <Typography.Text strong>Target Language</Typography.Text>
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
                        <Typography.Text strong>Category</Typography.Text>
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
                        <Typography.Text strong>Comic Genre</Typography.Text>
                        <Select
                            value={toneConfig.value}
                            onChange={toneConfig.onChange || undefined}
                            options={toneConfig.options || []}
                            placeholder={toneConfig.placeholder}
                            style={toneConfig.style}>
                        </Select>
                    </Col>
                )}
            </Row>
        </Card >
    )
}