/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Ant Design
 */
import { Input, Button, Space, Typography, message, Row, Col, Select, Modal, Card, Tag } from 'antd';
import { CopyOutlined, CameraOutlined, SettingOutlined, TranslationOutlined, PlusOutlined, DeleteOutlined, KeyOutlined, LinkOutlined, CloudOutlined, LaptopOutlined } from '@ant-design/icons';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestORCThunk } from '@/redux/features/orc';
import { requestOllamaThunk } from '@/redux/features/translate';

/**
 * Type
 */
import type { OCRRequest, OCRResponse } from "@/types/ocr.type";
import type { Setting } from "@/types/store.type";
import type { PromptParams } from "@/types/translate.type";

import { GetHistoryService, AddHistoryService, ClearHistoryService, GetSettingService, SaveSettingService } from "@/services/StoreServices";

/**
 * Config
 */
import { getLangCodeByLang, getOcrCodeByLang, getLangNameByLang } from "@/config/language.config";

interface TranslationPanelProps {
    defaultTranslate?: boolean;
}

const TranslationPanelPage: React.FC<TranslationPanelProps> = ({ defaultTranslate = false }) => {
    /**
     * Common State
     */
    const [sourceText, setSourceText] = useState<string>('');
    const [resultText, setResultText] = useState<string>('');
    const [isOcrTriggered, setIsOcrTriggered] = useState<boolean>(false);
    const [translating, setTranslating] = useState<boolean>(false);
    const [translatingOCR, setTranslatingOCR] = useState<boolean>(false);

    /**
     * Option State
     */
    const [mode, setMode] = useState<string | undefined>('Normal');
    const [model, setModel] = useState<string | undefined>(undefined);
    const [baseUrl, setBaseUrl] = useState<string | undefined>(undefined);
    const [sourceLang, setSourceLang] = useState<string | undefined>(undefined);
    const [targetLang, setTargetLang] = useState<string | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>('default');
    const [tone, setTone] = useState<PromptParams['tone'] | undefined>(undefined);

    /**
     * Advanced Option State
     */
    const [settingsPopupVisible, setSettingsPopupVisible] = useState<boolean>(false);
    const [providers, setProviders] = useState<Setting['provider']>([]);
    const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
    const [backendPort, setBackendPort] = useState<number>(8000);
    const [defaultProviderId, setDefaultProviderId] = useState<string>('');
    const [defaultOcrLanguage, setDefaultOcrLanguage] = useState<string>('');
    const [defaultSourceLanguage, setDefaultSourceLanguage] = useState<string | undefined>(undefined);
    const [defaultTargetLanguage, setDefaultTargetLanguage] = useState<string | undefined>(undefined);

    /**
     * Hook
     */
    const dispatch = useDispatch<AppDispatch>();

    /**
     * Copy text to clipboard
     */
    const copyToClipboard = (text: string, type: 'ocr' | 'translated') => {
        navigator.clipboard.writeText(text);
        message.success(`Copied ${type === 'ocr' ? 'original text' : 'translated text'}!`);
    };

    /**
     * Handle OCR translation
     */
    const handleORCTranslate = useCallback(async () => {
        setTranslatingOCR(true);
        handleClear();
        try {
            if (!sourceLang || !targetLang || !model) {
                throw new Error("Please select source, target, model.");
            }

            const result = await window.electronAPI.captureScreen();
            if (result.error) {
                throw new Error(result.error);
            }

            let ocrRequestParams: OCRRequest;
            console.log(mode);

            if (mode === 'Normal') {
                ocrRequestParams = {
                    mode: mode || 'Normal',
                    base64_text: result.base64,
                    ocr_lang: getOcrCodeByLang(sourceLang || '')?.ocrCode || 'en',
                    source_lang: getLangNameByLang(sourceLang || '')?.langName || 'English',
                    source_code: getLangCodeByLang(sourceLang || '')?.langCode || 'en',
                    target_lang: getLangNameByLang(targetLang || '')?.langName || 'Vietnamese',
                    target_code: getLangCodeByLang(targetLang || '')?.langCode || 'vi',
                }
            } else {
                const defaultProvider = providers.find(p => p.id === defaultProviderId);
                const baseUrl = defaultProvider?.base_url || 'http://localhost:11434';
                const apiKey = defaultProvider?.api_key || '';
                ocrRequestParams = {
                    mode: mode || 'AI',
                    model: model || 'translategemma:12b',
                    url: baseUrl || 'http://localhost:11434',
                    api_key: apiKey,
                    base64_text: result.base64,
                    ocr_lang: getOcrCodeByLang(sourceLang || '')?.ocrCode || 'en',
                    source_lang: getLangNameByLang(sourceLang || '')?.langName || 'English',
                    source_code: getLangCodeByLang(sourceLang || '')?.langCode || 'en',
                    target_lang: getLangNameByLang(targetLang || '')?.langName || 'Vietnamese',
                    target_code: getLangCodeByLang(targetLang || '')?.langCode || 'vi',
                    category: category || 'default',
                    tone: tone || 'casual',
                }
            }
            const ocrResult: OCRResponse = await dispatch(requestORCThunk(ocrRequestParams)).unwrap();

            /**
             * return source text from ocrResult.text
             */
            if (!ocrResult || !ocrResult.data?.source_text) {
                throw new Error(ocrResult?.message || "Failed to process OCR.");
            }
            setSourceText(ocrResult.data.source_text || '');

            /**
             * return translated text from ocrResult.text
             */
            if (!ocrResult || !ocrResult.data?.translated_text) {
                throw new Error(ocrResult?.message || "Failed to process translation.");
            }
            setResultText(ocrResult.data.translated_text || '');

            message.success('Translation successful!');
        } catch (error: any) {
            message.error(`Translation error: ${error.message}`);
        } finally {
            setTranslatingOCR(false);
        }
    }, [dispatch, mode, model, providers, defaultProviderId, category, tone, sourceLang, targetLang]);

    /**
     * Handle translation
     */
    const handleTranslate = useCallback(async () => {
        setTranslating(true);
        setResultText('');
        try {
            if (!sourceLang || !targetLang || !category) {
                throw new Error("Please select source, target, and category.");
            }

            let requestParams: PromptParams;
            let response: any;
            if (mode == "Normal") {
                requestParams = {
                    mode: mode || 'Normal',
                    text: sourceText || '',
                    source_lang: getLangNameByLang(sourceLang || '')?.langName || 'English',
                    source_code: getLangCodeByLang(sourceLang || '')?.langCode || 'en',
                    target_lang: getLangNameByLang(targetLang || '')?.langName || 'Vietnamese',
                    target_code: getLangCodeByLang(targetLang || '')?.langCode || 'vi',
                }
            } else {
                const defaultProvider = providers.find(p => p.id === defaultProviderId);
                const baseUrl = defaultProvider?.base_url || 'http://localhost:11434';
                const apiKey = defaultProvider?.api_key || '';
                requestParams = {
                    mode: mode || 'AI',
                    model: model || 'translategemma:12b',
                    url: baseUrl || 'http://localhost:11434',
                    api_key: apiKey,
                    text: sourceText || '',
                    source_lang: getLangNameByLang(sourceLang || '')?.langName || 'English',
                    source_code: getLangCodeByLang(sourceLang || '')?.langCode || 'en',
                    target_lang: getLangNameByLang(targetLang || '')?.langName || 'Vietnamese',
                    target_code: getLangCodeByLang(targetLang || '')?.langCode || 'vi',
                    category: category || 'default',
                    tone: tone || 'casual',
                }
                response = await dispatch(requestOllamaThunk(requestParams)).unwrap();
            }

            if (!response || !response.translated_text) {
                throw new Error("Failed to process translation.");
            }
            setResultText(response.translated_text || '');
            message.success('Translation successful!');
        }
        catch (error: any) {
            message.error(`Translation error: ${error.message}`);
        }
        finally {
            setTranslating(false);
        }
    }, [dispatch, mode, model, providers, defaultProviderId, sourceText, sourceLang, targetLang, category, tone]);

    /**
     * Handle load settings
     */
    const handleLoadSettings = async () => {
        try {
            const setting = await GetSettingService();
            if (setting) {
                setDefaultOcrLanguage(setting.default_ocr_language);
                setDefaultSourceLanguage(setting.default_source_language);
                setDefaultTargetLanguage(setting.default_target_language);
                setDefaultProviderId(setting.default_provider_id);
                setProviders(setting.provider || []);
            }
            if (setting.default_source_language) {
                setSourceLang(setting.default_source_language);
            }
            if (setting.default_target_language) {
                setTargetLang(setting.default_target_language);
            }
            if (setting.default_provider_id) {
                const provider = setting.provider.find((p: any) => p.id === setting.default_provider_id);
                if (provider?.model?.length) {
                    setModel(provider.model[0]);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        localStorage
    }



    /**
     * Handle save settings
     */
    const handleSaveSettings = async () => {
        try {
            await SaveSettingService({
                provider: providers,
                default_provider_id: defaultProviderId,
                default_ocr_language: defaultOcrLanguage,
                default_source_language: defaultSourceLanguage,
                default_target_language: defaultTargetLanguage,
            });
            setSourceLang(defaultSourceLanguage);
            setTargetLang(defaultTargetLanguage);
            message.success('Settings saved!');
            setSettingsPopupVisible(false);
        } catch (error: any) {
            message.error(`Save failed: ${error.message}`);
        }
    };

    /**
     * Handle clear
     */
    const handleClear = () => {
        setSourceText('');
        setResultText('');
    }

    const handleTranslateRef = useRef(handleORCTranslate);
    handleTranslateRef.current = handleORCTranslate;

    const sourceLangConfig = {
        value: sourceLang,
        onChange: setSourceLang,
        style: { width: '100%', marginTop: 8 },
        options: mode == "Normal" ? [
            { value: 'auto', label: 'Auto' },
            { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
            { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
            { value: 'english', label: 'English' },
            { value: 'japanese', label: 'Japanese' },
            { value: 'vietnamese', label: 'Vietnamese' },
            { value: 'korean', label: 'Korean' },
        ] : [
            { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
            { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
            { value: 'english', label: 'English' },
            { value: 'japanese', label: 'Japanese' },
            { value: 'vietnamese', label: 'Vietnamese' },
            { value: 'korean', label: 'Korean' },
        ],
        placeholder: 'Select Source Language',
    }

    const targetLangConfig = {
        value: targetLang,
        onChange: (value: string) => setTargetLang(value),
        style: { width: '100%', marginTop: 8 },
        options: [
            { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
            { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
            { value: 'english', label: 'English' },
            { value: 'japanese', label: 'Japanese' },
            { value: 'vietnamese', label: 'Vietnamese' },
            { value: 'korean', label: 'Korean' },
        ],
        placeholder: 'Select Target Language',
    }

    const ModeConfig = {
        value: mode,
        onChange: (value: string | undefined) => setMode(value),
        style: { width: '100%', marginTop: 8 },
        options: [
            { value: 'Normal', label: 'Normal' },
            { value: 'AI', label: 'AI' },
        ],
        placeholder: 'Select Mode',
    }

    const defaultProvider = providers.find((p) => p.id === defaultProviderId,);
    const modelOptions = (defaultProvider?.model || []).map(
        (m: string) => ({ value: m, label: m }),
    );
    const ModelConfig = {
        value: model,
        onChange: (value: string | undefined) => setModel(value),
        style: { width: '100%', marginTop: 8 },
        options: modelOptions,
        placeholder: 'Select Model',
    }

    const textTypeConfig = {
        value: category,
        onChange: (value: string | undefined) => setCategory(value),
        style: { width: '100%', marginTop: 8 },
        options: [
            { value: 'comic', label: 'Comic' },
            { value: 'novel', label: 'Novel' },
            { value: 'email', label: 'Email' },
            { value: 'subtitles', label: 'Subtitles' },
            { value: 'technical', label: 'Technical' },
            { value: 'default', label: 'Default' },
        ],
        placeholder: 'Select Category',
    }

    const toneConfig = {
        value: tone,
        onChange: setTone,
        style: { width: '100%', marginTop: 8, },
        options: [
            { value: 'casual', label: 'Casual' },
            { value: 'action_adventure', label: 'Action / Adventure' },
            { value: 'formal', label: 'Formal' },
            { value: 'dramatic', label: 'Dramatic' },
            { value: 'comedic', label: 'Comedic' },
            { value: 'romantic', label: 'Romantic' },
            { value: 'fantasy_isekai', label: 'Fantasy / Isekai' },
            { value: 'scifi_mecha', label: 'Sci-Fi / Mecha' },
            { value: 'adult', label: 'Adult' },
        ],
        placeholder: 'Select Tone',
    }

    useEffect(() => {
        const handler = () => handleTranslateRef.current();
        window.electronAPI?.onTriggerCapture(handler);
        return () => {
            window.electronAPI?.removeTriggerCapture(handler);
        };
    }, []);

    useEffect(() => {
        if (isOcrTriggered && sourceText && sourceText.trim() !== '') {
            handleORCTranslate();
            setIsOcrTriggered(false);
        }
    }, [sourceText, handleORCTranslate]);

    useEffect(() => {
        handleLoadSettings();
    }, []);

    useEffect(() => {
        const provider = providers.find((p) => p.id === defaultProviderId,);
        if (provider?.model?.length) {
            setModel(provider.model[0]);
        }
    }, [defaultProviderId, providers]);

    return (
        <React.Fragment>
            <Row style={{ background: 'linear-gradient(135deg, #A3A6D8 0%, #1a1a2e 50%, #16213e 100%)', padding: 20, minHeight: '100vh', boxSizing: 'border-box' }}>
                {/* Title */}
                <Row style={{ width: '100%', maxWidth: '100%' }}>
                    <Col span={24}>
                        <Typography.Title level={4} style={{ margin: 0, textAlign: 'center', color: '#fff' }}>
                            Translator
                        </Typography.Title>
                    </Col>
                </Row>

                <Row style={{ width: '100%', maxWidth: '100%' }} gutter={[16, 16]}>
                    {/* Input OCR */}
                    <Col span={24} md={{ span: 18, order: 1 }} xs={{ order: 2 }}>
                        <Row style={{ width: '100%', maxWidth: '100%' }} gutter={[0, 16]}>
                            <Col span={24} style={{ background: '#A3A6D8', padding: 20, borderRadius: 20, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                                {/* Input OCR */}
                                <Typography.Text strong style={{ color: '#fff' }}>Input Text - {getLangNameByLang(sourceLang || '')?.langName || sourceLang}</Typography.Text>
                                <Input.TextArea rows={8} value={sourceText} onChange={(e) => { setIsOcrTriggered(false); setSourceText(e.target.value); }} placeholder="Captured text will appear here..." style={{ fontFamily: 'monospace', marginTop: 8, fontSize: 18 }} />
                                <Row justify="start" align="middle" style={{ marginTop: 8 }}>
                                    <Space wrap={true}>
                                        <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(sourceText, 'ocr')} disabled={!sourceText}>
                                            Copy
                                        </Button>
                                        <Button onClick={() => handleClear()} disabled={!sourceText}>
                                            Clear
                                        </Button>
                                        <Button type="primary" icon={<TranslationOutlined />} onClick={() => handleTranslate()} loading={translating} disabled={translatingOCR}>
                                            Translate
                                        </Button>
                                        <Button type="primary" icon={<CameraOutlined />} onClick={() => handleORCTranslate()} loading={translatingOCR} disabled={translating}>
                                            Capture
                                        </Button>
                                    </Space>
                                </Row>
                            </Col>

                            {/* Translation Result (Vietnamese) */}
                            <Col span={24} style={{ background: '#A3A6D8', padding: 16, borderRadius: 20, backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
                                <Typography.Text strong style={{ color: '#fff' }}>Translation Result - {getLangNameByLang(targetLang || '')?.langName || targetLang}</Typography.Text>
                                <Input.TextArea rows={8} value={resultText} readOnly placeholder={translating || translatingOCR ? "Translating..." : "Translation will appear here"} style={{ fontFamily: 'monospace', marginTop: 8, background: '#fafafa', fontSize: 18, cursor: 'not-allowed' }} />
                                <Row justify="start" align="middle" style={{ marginTop: 8 }}>
                                    <Space wrap={true}>
                                        <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(resultText, 'translated')} disabled={!resultText} style={{ marginTop: 8 }}>
                                            Copy
                                        </Button>
                                    </Space>
                                </Row>
                            </Col>
                        </Row>
                    </Col>

                    {/* Option */}
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
                                        <Select {...ModeConfig} />
                                    </Col>
                                    {['AI'].includes(mode || '') && (
                                        <Col xs={24}>
                                            <Typography.Text strong style={{ color: '#fff' }}>Model</Typography.Text>
                                            <Select {...ModelConfig} />
                                        </Col>
                                    )}
                                    <Col xs={24}>
                                        <Typography.Text strong style={{ color: '#fff' }}>Source Language</Typography.Text>
                                        <Select {...sourceLangConfig} />
                                    </Col>
                                    <Col xs={24}>
                                        <Typography.Text strong style={{ color: '#fff' }}>Target Language</Typography.Text>
                                        <Select {...targetLangConfig} />
                                    </Col>
                                    {['AI'].includes(mode || '') && (
                                        <Col xs={24}>
                                            <Typography.Text strong style={{ color: '#fff' }}>Category</Typography.Text>
                                            <Select {...textTypeConfig} />
                                        </Col>
                                    )}
                                    {/* Show Comic Genre when Category is Comic / Manga */}
                                    {(['AI'].includes(mode || '') && ['comic', 'novel'].includes(category || '')) && (
                                        <Col xs={24}>
                                            <Typography.Text strong style={{ color: '#fff' }}>Comic Genre</Typography.Text>
                                            <Select {...toneConfig} />
                                        </Col>
                                    )}
                                </Row>
                            </div>
                            <Button type="text" icon={<SettingOutlined />} onClick={() => setSettingsPopupVisible(true)} style={{ marginBottom: 12, color: '#fff' }} >
                                Advanced Settings
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Row>
            <Modal title="⚙️ Advanced Translation Settings" open={settingsPopupVisible} onCancel={() => setSettingsPopupVisible(false)} width={900}
                footer={[
                    <Button key="cancel" onClick={() => setSettingsPopupVisible(false)}>Cancel</Button>,
                    <Button key="save" type="primary" onClick={handleSaveSettings} icon={<SettingOutlined />}>Save Settings</Button>,
                ]}>
                <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 8 }}>

                    {/* ===== GROUP A: Default Language Settings ===== */}
                    <Card title={<span>🌐 Default Language Settings</span>} size="small" style={{ marginBottom: 16 }}>
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
                                        { value: 'japan', label: 'Japanese' },
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

                    <Card title={<span>🔌 API Providers</span>} size="small" style={{ marginBottom: 16 }}
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
                                                    <Tag
                                                        key={mi}
                                                        color="purple"
                                                        style={{ fontSize: 11 }}
                                                        closable
                                                        onClose={() => {
                                                            const newList = [...providers];
                                                            newList[index] = {
                                                                ...provider,
                                                                model: (provider.model || []).filter((_, i) => i !== mi)
                                                            };
                                                            setProviders(newList);
                                                        }}
                                                    >{m}</Tag>
                                                ))}
                                                <Input
                                                    size="small"
                                                    style={{ width: 160 }}
                                                    placeholder="Model name..."
                                                    id={`model-input-${index}`}
                                                    onPressEnter={() => {
                                                        const input = document.getElementById(`model-input-${index}`) as HTMLInputElement;
                                                        const val = input?.value?.trim();
                                                        if (val) {
                                                            const newList = [...providers];
                                                            newList[index] = {
                                                                ...provider,
                                                                model: [...(provider.model || []), val]
                                                            };
                                                            setProviders(newList);
                                                        }
                                                        if (input) input.value = '';
                                                    }}
                                                />
                                                <Button
                                                    size="small"
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => {
                                                        const input = document.getElementById(`model-input-${index}`) as HTMLInputElement;
                                                        const val = input?.value?.trim();
                                                        if (val) {
                                                            const newList = [...providers];
                                                            newList[index] = {
                                                                ...provider,
                                                                model: [...(provider.model || []), val]
                                                            };
                                                            setProviders(newList);
                                                        }
                                                        if (input) input.value = '';
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
        </React.Fragment>
    );

};

export default TranslationPanelPage;