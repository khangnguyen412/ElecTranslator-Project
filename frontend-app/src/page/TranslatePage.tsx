/* eslint-disable */
import React, {useEffect} from 'react';

/**
 * Ant Design
 */
import { Typography, Row, Col } from 'antd';

/**
 * Component
 */
import { InputCard } from '@/components/translation/InputCard';
import { ResultCard } from '@/components/translation/ResultCard';
import { AdvancedSettingsModal } from '@/components/translation/AdvancedSettingsModal';
import { OptionsPanel } from '@/components/translation/OptionsPanel';

/**
 * Hook
 */
import { useTranslation } from '@/hook/useTranslation';
import { useTranslationSettings } from "@/hook/useTranslationSettings";

/**
 * Config
 */
import { getLangNameByLang } from "@/config/language.config";

const TranslationPage: React.FC = () => {
    /**
     * Hook
     */
    const {
        defaultOcrLanguage, defaultSourceLanguage, defaultTargetLanguage,
        defaultProviderId, providers, settingsPopupVisible,
        openSettings, closeSettings, setDefaultOcrLanguage,
        setDefaultSourceLanguage, setDefaultTargetLanguage,
        setDefaultProviderId, setProviders, loadSettings, saveSettings
    } = useTranslationSettings();
    const defaultProvider = providers.find(p => p.id === defaultProviderId);
    const modelOptions = (defaultProvider?.model || []).map(m => ({ label: m, value: m, }));
    const translation = useTranslation({providers, defaultProviderId, modelOptions})

    /**
     * Handle load settings
     */
    useEffect(() => {
        loadSettings();
    }, []);

    /**
     * Handle load default model
     */
    useEffect(() => {
        if (defaultProvider?.model?.length) {
            translation.setModel(defaultProvider.model[0]);
        }
    }, [defaultProviderId, providers, translation]);

    /**
     * Handle Sync source/target lang when settings loaded
     */
    useEffect(() => {
        if (defaultSourceLanguage) translation.setSourceLang(defaultSourceLanguage);
        if (defaultTargetLanguage) translation.setTargetLang(defaultTargetLanguage);
    }, [defaultSourceLanguage, defaultTargetLanguage, translation]);

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
                                sourceText={translation.sourceText}
                                sourceLangName={getLangNameByLang(translation.sourceLang || '')?.langName || translation.sourceLang}
                                translating={translation.translating}
                                translatingOCR={translation.translatingOCR}
                                onSourceTextChange={translation.setSourceText}
                                onCopy={() => translation.handleCopyToClipboard(translation.sourceText, 'ocr')}
                                onClear={() => translation.handleClear()}
                                onTranslate={() => translation.handleTranslate()}
                                onCapture={() => translation.handleTranslateOCR()}>
                            </InputCard>

                            {/* Translation Result (Vietnamese) */}
                            <ResultCard
                                translatedText={translation.resultText}
                                targetLangName={getLangNameByLang(translation.targetLang || '')?.langName || translation.targetLang}
                                translating={translation.translating || translation.translatingOCR}
                                onCopy={() => translation.handleCopyToClipboard(translation.resultText, 'translated')}>
                            </ResultCard>
                        </Row>
                    </Col>

                    {/* Option */}
                    <OptionsPanel
                        mode={translation.mode}
                        category={translation.category}
                        modeConfig={translation.modeConfig}
                        modelConfig={translation.modelConfig}
                        sourceConfig={translation.sourceLangConfig}
                        targetConfig={translation.targetLangConfig}
                        categoryConfig={translation.categoryConfig}
                        toneConfig={translation.toneConfig}
                        onOpenAdvancedSettings={openSettings}>
                    </OptionsPanel>

                </Row>
            </Row>
            <AdvancedSettingsModal
                open={settingsPopupVisible}
                onCancel={closeSettings}
                onSave={saveSettings}
                languageDefaults={{
                    ocr: defaultOcrLanguage,
                    source: defaultSourceLanguage,
                    target: defaultTargetLanguage,
                    onOcrChange: setDefaultOcrLanguage,
                    onSourceChange: setDefaultSourceLanguage,
                    onTargetChange: setDefaultTargetLanguage,
                }}
                providerSettings={{
                    providers,
                    defaultProviderId,
                    onDefaultProviderChange: setDefaultProviderId,
                    onProvidersChange: setProviders,
                }}>
            </AdvancedSettingsModal>
        </React.Fragment>
    );

};

export default TranslationPage;