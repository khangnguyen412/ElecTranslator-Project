/* eslint-disable */
import React, { useEffect } from 'react';

/**
 * Ant Design
 */
import { Row, Col } from 'antd';

/**
 * Styles
 */
import '@/assets/scss/page/stranslate.scss';

/**
 * Component
 */
import { useAppSettings } from '@/page/layout/MainLayout';
import { InputCard } from '@/components/translation/InputCard';
import { ResultCard } from '@/components/translation/ResultCard';
import { OptionsPanel } from '@/components/translation/OptionsPanel';

/**
 * Hook
 */
import { useTranslation } from '@/hook/useTranslation';

/**
 * Config
 */
import { getLangNameByLang } from "@/config/language.config";

const TranslationPage: React.FC = () => {


    /**
     * Hook
     */
    const { defaultSourceLanguage, defaultTargetLanguage, defaultProviderId, providers } = useAppSettings();
    const defaultProvider = providers.find(p => p.id === defaultProviderId);
    const modelOptions = (defaultProvider?.model || []).map(m => ({ label: m, value: m, }));
    const translation = useTranslation({ providers, defaultProviderId, modelOptions })

    /**
     * Handle load default model
     */
    useEffect(() => {
        if (defaultProvider?.model?.length) {
            translation.setModel(defaultProvider.model[0]);
        }
    }, [defaultProviderId, providers]);

    /**
     * Handle Sync source/target lang when settings loaded
     */
    useEffect(() => {
        if (defaultSourceLanguage) translation.setSourceLang(defaultSourceLanguage);
        if (defaultTargetLanguage) translation.setTargetLang(defaultTargetLanguage);
    }, [defaultSourceLanguage, defaultTargetLanguage]);

    return (
        <React.Fragment>
            <Row className="translation-page-content" gutter={[24, 24]}>
                <Col span={24} lg={{ span: 16, order: 1 }} md={{ order: 2 }} xs={{ order: 2 }}>
                    <Row className="translation-row-full" gutter={[0, 16]}>
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
                <Col span={24} lg={{ span: 8, order: 2 }} md={{ order: 1 }} xs={{ order: 1 }}>
                    <OptionsPanel
                        key={`${translation.mode}-${translation.category}`}
                        mode={translation.mode}
                        category={translation.category}
                        modeConfig={translation.modeConfig}
                        modelConfig={translation.modelConfig}
                        sourceConfig={translation.sourceLangConfig}
                        targetConfig={translation.targetLangConfig}
                        categoryConfig={translation.categoryConfig}
                        toneConfig={translation.toneConfig}>
                    </OptionsPanel>
                </Col>
            </Row>
        </React.Fragment>
    );
};

export default TranslationPage;