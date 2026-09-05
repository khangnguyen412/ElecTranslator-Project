/**
 * AdvancedSettingsModal
 * =====================
 */

import React, { useState } from 'react';

/**
 * Ant Design
 */
import { Modal, Button, Input, Select, Card, Row, Col, Typography, Space, Tag } from 'antd';
import { SettingOutlined, PlusOutlined, KeyOutlined, LinkOutlined, CloudOutlined, LaptopOutlined } from '@ant-design/icons';

/**
 * Type
 */
import type { Setting } from "@/types/store.type";
interface LanguageDefaults {
    ocr: string;
    onOcrChange: (lang: string) => void;
    source: string | undefined;
    onSourceChange: (lang: string | undefined) => void;
    target: string | undefined;
    onTargetChange: (lang: string | undefined) => void;
}

interface ProviderSettings {
    providers: Setting['provider'];
    defaultProviderId: string;
    onDefaultProviderChange: (id: string) => void;
    onProvidersChange: React.Dispatch<React.SetStateAction<Setting['provider']>>;
}

interface AdvancedSettingsModalProps {
    open: boolean;
    onCancel: () => void;
    onSave: () => void;
    languageDefaults: LanguageDefaults;
    providerSettings: ProviderSettings;

}

export const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({ open, onCancel, onSave, languageDefaults, providerSettings, }) => {
    const {
        ocr: defaultOcrLanguage,
        source: defaultSourceLanguage,
        target: defaultTargetLanguage,
        onOcrChange: setDefaultOcrLanguage,
        onSourceChange: setDefaultSourceLanguage,
        onTargetChange: setDefaultTargetLanguage,
    } = languageDefaults;
    const {
        providers,
        defaultProviderId,
        onDefaultProviderChange: setDefaultProviderId,
        onProvidersChange: setProviders,
    } = providerSettings;
    const [newModelInput, setNewModelInput] = useState<Record<string, string>>({});

    return (
        <Modal title="Advanced Translation Settings" open={open} onCancel={onCancel} width={900}
            footer={[
                <Button key="cancel" onClick={onCancel}>Cancel</Button>,
                <Button key="save" type="primary" onClick={onSave} icon={<SettingOutlined />}>Save Settings</Button>,
            ]}>
            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 8 }}>

                {/* ===== GROUP A: Default Language Settings ===== */}
                <Card title={<span>Default Language Settings</span>} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={[16, 12]}>
                        <Col span={8}>
                            <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>OCR Language</Typography.Text>
                            <Select
                                value={defaultOcrLanguage}
                                onChange={setDefaultOcrLanguage}
                                style={{ width: '100%', marginTop: 4 }}
                                options={[
                                    { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
                                    { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
                                    { value: 'english', label: 'English' },
                                    { value: 'japanese', label: 'Japanese' },
                                    { value: 'korean', label: 'Korean' },
                                    { value: 'vietnamese', label: 'Vietnamese' },
                                ]}
                            />
                        </Col>
                        <Col span={8}>
                            <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>Source Language</Typography.Text>
                            <Select
                                value={defaultSourceLanguage}
                                onChange={setDefaultSourceLanguage}
                                style={{ width: '100%', marginTop: 4 }}
                                options={[
                                    { value: 'auto', label: 'Auto' },
                                    { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
                                    { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
                                    { value: 'english', label: 'English' },
                                    { value: 'japanese', label: 'Japanese' },
                                    { value: 'vietnamese', label: 'Vietnamese' },
                                    { value: 'korean', label: 'Korean' },
                                ]}
                            />
                        </Col>
                        <Col span={8}>
                            <Typography.Text style={{ fontSize: 13, fontWeight: 500 }}>Target Language</Typography.Text>
                            <Select
                                value={defaultTargetLanguage}
                                onChange={setDefaultTargetLanguage}
                                style={{ width: '100%', marginTop: 4 }}
                                options={[
                                    { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
                                    { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
                                    { value: 'english', label: 'English' },
                                    { value: 'japanese', label: 'Japanese' },
                                    { value: 'vietnamese', label: 'Vietnamese' },
                                    { value: 'korean', label: 'Korean' },
                                ]}
                            />
                        </Col>
                    </Row>
                </Card>

                <Card title={<span>API Providers</span>} size="small" style={{ marginBottom: 16 }}
                    extra={
                        <Space>
                            <Typography.Text style={{ fontSize: 13 }}>Default:</Typography.Text>
                            <Select
                                value={defaultProviderId}
                                onChange={setDefaultProviderId}
                                style={{ width: 140 }}
                                options={providers.map(p => ({ value: p.id, label: p.name }))}
                            />
                        </Space>
                    }>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {providers.map((provider, index) => (
                            <Card
                                key={provider.id}
                                size="small"
                                style={{
                                    marginBottom: 8,
                                    borderLeft: `3px solid ${provider.type === 'local' ? '#52c41a' : '#1677ff'}`
                                }}
                                title={
                                    <Space>
                                        {provider.type === 'local' ? <LaptopOutlined style={{ color: '#52c41a' }} /> : <CloudOutlined style={{ color: '#1677ff' }} />}
                                        <span>{provider.name}</span>
                                        <Tag color={provider.type === 'local' ? 'green' : 'blue'} style={{ fontSize: 11 }}>
                                            {provider.type === 'local' ? 'Local' : 'Cloud'}
                                        </Tag>
                                    </Space>
                                }>
                                <Row gutter={[12, 8]}>
                                    <Col span={12}>
                                        <Typography.Text style={{ fontSize: 12, color: '#888' }}>Base URL</Typography.Text>
                                        <Input size="small" value={provider.base_url}
                                            onChange={(e) => {
                                                const newList = [...providers];
                                                newList[index] = { ...provider, base_url: e.target.value };
                                                setProviders(newList);
                                            }}
                                            style={{ marginTop: 2 }}
                                            prefix={<LinkOutlined />}
                                            placeholder={provider.type === 'local' ? 'http://localhost:11434/v1/chat/completions' : 'https://api.openai.com/v1'}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Typography.Text style={{ fontSize: 12, color: '#888' }}>API Key</Typography.Text>
                                        <Input.Password
                                            size="small"
                                            value={provider.api_key}
                                            onChange={(e) => {
                                                const newList = [...providers];
                                                newList[index] = { ...provider, api_key: e.target.value };
                                                setProviders(newList);
                                            }}
                                            style={{ marginTop: 2 }}
                                            prefix={<KeyOutlined />}
                                            placeholder={provider.type === 'local' ? 'Not needed' : 'sk-...'}
                                        />
                                    </Col>
                                    <Col span={24}>
                                        <Typography.Text style={{ fontSize: 12, color: '#888' }}>Models</Typography.Text>
                                        <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                                            {(provider.model || []).map((m: string, mi: number) => (
                                                <Tag key={m} color="purple" style={{ fontSize: 11 }} closable
                                                    onClose={() => {
                                                        const newList = [...providers];
                                                        newList[index] = { ...provider, model: (provider.model || []).filter((_, i) => i !== mi) };
                                                        setProviders(newList);
                                                    }}>{m}</Tag>
                                            ))}
                                            <Input
                                                size="small"
                                                style={{ width: 160 }}
                                                placeholder="Model name..."
                                                value={newModelInput[provider.id] || ''}
                                                onChange={(e) =>
                                                    setNewModelInput(prev => ({ ...prev, [provider.id]: e.target.value }))
                                                }
                                                onPressEnter={() => {
                                                    const val = (newModelInput[provider.id] || '').trim();
                                                    if (val) {
                                                        const newList = [...providers];
                                                        newList[index] = {
                                                            ...provider,
                                                            model: [...(provider.model || []), val]
                                                        };
                                                        setProviders(newList);
                                                    }
                                                    setNewModelInput(prev => ({ ...prev, [provider.id]: '' }));
                                                }}
                                            />
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => {
                                                    const val = (newModelInput[provider.id] || '').trim();
                                                    if (val) {
                                                        const newList = [...providers];
                                                        newList[index] = {
                                                            ...provider,
                                                            model: [...(provider.model || []), val]
                                                        };
                                                        setProviders(newList);
                                                    }
                                                    setNewModelInput(prev => ({ ...prev, [provider.id]: '' }));
                                                }}
                                            >Add</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        ))}
                    </div>
                </Card>

            </div>
        </Modal>
    )
}
