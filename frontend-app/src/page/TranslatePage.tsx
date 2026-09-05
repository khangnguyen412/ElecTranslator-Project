/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Ant Design
 */
import { Typography, message, Row, Col } from 'antd';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestORCThunk } from '@/redux/features/orc';
import { requestAIThunk, NormalTranslateResponse } from '@/redux/features/translate';

/**
 * Component
 */
import { InputCard } from '@/components/translation/InputCard';
import { ResultCard } from '@/components/translation/ResultCard';
import { AdvancedSettingsModal } from '@/components/translation/AdvancedSettingsModal';
import { OptionsPanel } from '@/components/translation/OptionsPanel';

/**
 * Config
 */
import { SOURCE_LANG_OPTIONS, SOURCE_LANG_OPTIONS_AI, TARGET_LANG_OPTIONS, MODE_OPTIONS, CATEGORY_OPTIONS, TONE_OPTIONS } from "@/config/translationOptions.config";

/**
 * Type
 */
import type { OCRRequest, OCRResponse } from "@/types/ocr.type";
import type { Setting } from "@/types/store.type";
import type { PromptParams } from "@/types/translate.type";

/**
 * Service
 */
import { GetSettingService, SaveSettingService } from "@/services/StoreServices";

/**
 * Config
 */
import { getLangCodeByLang, getOcrCodeByLang, getLangNameByLang } from "@/config/language.config";

const TranslationPage: React.FC = () => {
    /**
     * Common State
     */
    const [sourceText, setSourceText] = useState<string>('');
    const [resultText, setResultText] = useState<string>('');
    const [translating, setTranslating] = useState<boolean>(false);
    const [translatingOCR, setTranslatingOCR] = useState<boolean>(false);

    /**
     * Option State
     */
    const [mode, setMode] = useState<string | undefined>('Normal');
    const [model, setModel] = useState<string | undefined>(undefined);
    const [sourceLang, setSourceLang] = useState<string | undefined>(undefined);
    const [targetLang, setTargetLang] = useState<string | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>('default');
    const [tone, setTone] = useState<PromptParams['tone'] | undefined>(undefined);

    /**
     * Advanced Option State
     */
    const [settingsPopupVisible, setSettingsPopupVisible] = useState<boolean>(false);
    const [providers, setProviders] = useState<Setting['provider']>([]);
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

            if (mode === 'Normal') {
                ocrRequestParams = {
                    mode: mode || 'Normal',
                    base64_text: result.base64,
                    ocr_lang: getOcrCodeByLang(sourceLang || '')?.ocrCode || getOcrCodeByLang(defaultOcrLanguage || '')?.ocrCode || 'en',
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
                    provider: defaultProvider?.id || 'ollama',
                    model: model || 'translategemma:12b',
                    url: baseUrl || 'http://localhost:11434',
                    api_key: apiKey,
                    base64_text: result.base64,
                    ocr_lang: getOcrCodeByLang(sourceLang || '')?.ocrCode || getOcrCodeByLang(defaultOcrLanguage || '')?.ocrCode || 'en',
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
                response = await dispatch(NormalTranslateResponse(requestParams)).unwrap();
            } else {
                const defaultProvider = providers.find(p => p.id === defaultProviderId);
                const baseUrl = defaultProvider?.base_url || 'http://localhost:11434';
                const apiKey = defaultProvider?.api_key || '';
                requestParams = {
                    mode: mode || 'AI',
                    provider: defaultProvider?.id || 'ollama',
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
                response = await dispatch(requestAIThunk(requestParams)).unwrap();
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
        options: mode == "Normal" ? SOURCE_LANG_OPTIONS : SOURCE_LANG_OPTIONS_AI,
        placeholder: 'Select Source Language',
    }

    const targetLangConfig = {
        value: targetLang,
        onChange: (value: string) => setTargetLang(value),
        style: { width: '100%', marginTop: 8 },
        options: TARGET_LANG_OPTIONS,
        placeholder: 'Select Target Language',
    }

    const ModeConfig = {
        value: mode,
        onChange: (value: string | undefined) => setMode(value),
        style: { width: '100%', marginTop: 8 },
        options: MODE_OPTIONS,
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

    const categoryConfig = {
        value: category,
        onChange: (value: string | undefined) => setCategory(value),
        style: { width: '100%', marginTop: 8 },
        options: CATEGORY_OPTIONS,
        placeholder: 'Select Category',
    }

    const toneConfig = {
        value: tone,
        onChange: setTone,
        style: { width: '100%', marginTop: 8, },
        options: TONE_OPTIONS,
        placeholder: 'Select Tone',
    }

    const languageDefaultsConfig = {
        ocr: defaultOcrLanguage,
        source: defaultSourceLanguage,
        target: defaultTargetLanguage,
        onOcrChange: setDefaultOcrLanguage,
        onSourceChange: setDefaultSourceLanguage,
        onTargetChange: setDefaultTargetLanguage,
    }

    const providerSettingsConfig = {
        providers,
        defaultProviderId,
        onDefaultProviderChange: setDefaultProviderId,
        onProvidersChange: setProviders,
    }

    /**
     * Handle trigger capture
     */
    useEffect(() => {
        const handler = () => handleTranslateRef.current();
        window.electronAPI?.onTriggerCapture(handler);
        return () => {
            window.electronAPI?.removeTriggerCapture(handler);
        };
    }, []);

    /**
     * Handle load settings
     */
    useEffect(() => {
        handleLoadSettings();
    }, []);

    /**
     * Handle load default model
     */
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
                    <Col span={24} md={{ span: 18, order: 1 }} xs={{ order: 2 }}>
                        <Row style={{ width: '100%', maxWidth: '100%' }} gutter={[0, 16]}>
                            {/* Input OCR */}
                            <InputCard
                                sourceText={sourceText}
                                sourceLangName={getLangNameByLang(sourceLang || '')?.langName || sourceLang}
                                translating={translating}
                                translatingOCR={translatingOCR}
                                onSourceTextChange={(text) => { setSourceText(text) }}
                                onCopy={() => copyToClipboard(sourceText, 'ocr')}
                                onClear={() => handleClear()}
                                onTranslate={() => handleTranslate()}
                                onCapture={() => handleORCTranslate()}>
                            </InputCard>

                            {/* Translation Result (Vietnamese) */}
                            <ResultCard
                                translatedText={resultText}
                                targetLangName={getLangNameByLang(targetLang || '')?.langName || targetLang}
                                translating={translating || translatingOCR}
                                onCopy={() => copyToClipboard(resultText, 'translated')}>
                            </ResultCard>
                        </Row>
                    </Col>

                    {/* Option */}
                    <OptionsPanel
                        mode={mode}
                        category={category}
                        modeConfig={ModeConfig}
                        modelConfig={ModelConfig}
                        sourceConfig={sourceLangConfig}
                        targetConfig={targetLangConfig}
                        categoryConfig={categoryConfig}
                        toneConfig={toneConfig}
                        onOpenAdvancedSettings={() => setSettingsPopupVisible(true)}>
                    </OptionsPanel>

                </Row>
            </Row>
            <AdvancedSettingsModal
                open={settingsPopupVisible}
                onCancel={() => setSettingsPopupVisible(false)}
                onSave={handleSaveSettings}
                languageDefaults={languageDefaultsConfig}
                providerSettings={providerSettingsConfig}>
            </AdvancedSettingsModal>
        </React.Fragment>
    );

};

export default TranslationPage;