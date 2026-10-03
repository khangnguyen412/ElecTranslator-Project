/* eslint-disable */
import React, { useEffect } from 'react';

/**
 * Ant Design
 */
import { Typography, Row, Col, ConfigProvider } from 'antd';

/**
 * Styles
 */
import '@/assets/scss/page/stranslate.scss';

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
    const theme = {
        token: {
            // --- 1. Brand Colors (Primary Palette) ---
            // Primary brand color used for main actions, active states, and highlights
            colorPrimary: 'rgb(136, 136, 136)',
            // Hover state color for primary elements
            colorPrimaryHover: 'rgb(163, 163, 163)',
            // Active/Click state color for primary elements
            colorPrimaryActive: 'rgb(30, 40, 46)',
            // Light background color of primary color (e.g., selected item background)
            // colorPrimaryBg: '',
            // Hover state color for the primary light background
            // colorPrimaryBgHover: '',
            // Stroke/Border color under the primary color gradient
            // colorPrimaryBorder: '',

            // --- 2. Global Backgrounds & Text ---
            // Container background color (e.g., default button, input box, cards)
            colorBgContainer: 'rgb(30, 40, 46)',
            // Background color for disabled containers
            colorBgContainerDisabled: 'rgba(255, 255, 255, 0.33)',
            // Main text color across the entire system
            colorText: 'rgb(255, 255, 255)',
            // Text color for disabled elements
            colorTextDisabled: 'rgb(136, 136, 136)',
            // Highlight text color on components with background colors (e.g., Primary Button)
            colorTextLightSolid: 'rgb(255, 255, 255)',

            // --- 3. Error Validation Colors ---
            // Used to represent operational failures (e.g., error Button, error Input)
            // colorError: '',
            // Hover state of the error color
            // colorErrorHover: '',
            // Active state of the error color
            // colorErrorActive: '',
            // Background color of the error state
            // colorErrorBg: '',
            // Active state background color of the error state
            // colorErrorBgActive: '',

            // --- 4. Hyperlink Colors (Link Button / Anchor) ---
            // Control the color of hyperlinks
            // colorLink: '',
            // Control the color of hyperlinks when hovering
            // colorLinkHover: '',
            // Control the color of hyperlinks when clicked
            // colorLinkActive: '',

            // --- 5. Global Typography ---
            // The most widely used base font size in the design system
            // fontSize: 14,

            // --- 6. Borders & Layout Shapes ---
            // Border radius of base components (e.g., standard Button, Input)
            // borderRadius: 6,
            // Large border radius used in large components (e.g., Card, Modal)
            // borderRadiusLG: 8,
            // Small border radius used in small components (e.g., small Button, small Input)
            // borderRadiusSM: 4,
            // Border style of base components
            // lineType: 'solid',
            // Border width of base components
            // lineWidth: 1,
            // Width of the outline outline line when the component is in focus
            // lineWidthFocus: 3,

            // --- 7. Control Heights (Component Thickness) ---
            // The height of basic controls (e.g., standard buttons, standard input boxes)
            // controlHeight: 32,
            // Height of large components (Large size)
            // controlHeightLG: 40,
            // Height of small components (Small size)
            // controlHeightSM: 24,

            // --- 8. Animation & Motion Speeds ---
            // Medium animation transition duration
            // motionDurationMid: '',
            // Slow animation transition duration
            // motionDurationSlow: '',
            // Preset global motion curve
            // motionEaseInOut: '',
            // Global opacity value during loading states
            // opacityLoading: 0.65,
        },
        components: {
            Input: {
                // --- 1. Default State ---
                // Background color of the input & textarea
                // colorBgContainer: '',
                // Border color in normal status  
                // colorBorder: '',
                // Text color inside the input/textarea 
                colorText: 'rgb(255, 255, 255)',
                // Placeholder text color                             
                colorTextPlaceholder: 'rgb(136, 136, 136)',

                // --- 2. Hover & Focus States ---
                // Border color on hover
                // colorBorderHover: '',
                // Border color on focus
                // colorPrimaryHover: '',
                // Outline glow color on focus
                // controlOutline: '',

                // --- 3. Disabled State ---
                // Background color when disabled
                colorBgContainerDisabled: 'rgb(30, 40, 46)',
                // Text color when disabled
                colorTextDisabled: 'rgb(255, 255, 255)',
                // --- 4. Error Validation State (status="error") ---
                // Border color in error state
                // colorError: '',
                // Border color on hover in error state
                // colorErrorHover: '',
                // Outline glow color on focus in error state 
                // colorErrorOutline: '',

                // --- 5. Warning Validation State (status="warning") ---
                // Border color in warning state
                // colorWarning: '',
                // Border color on hover in warning state
                // colorWarningHover: '',
                // Outline glow color on focus in warning state 
                // colorWarningOutline: '',
            },
            Select: {
                // --- 1. Selector Box (Normal State) ---
                // Background color of the selector box
                colorBgContainer: 'rgb(30, 40, 46)',
                // Border color of the selector box
                // colorBorder: '',
                // Text color of the selected item
                colorText: 'rgb(255, 255, 255)',
                // Placeholder text color
                colorTextPlaceholder: 'rgb(136, 136, 136)',
                // Color of the dropdown arrow icon
                // colorIcon: '',
                // Color of the dropdown arrow icon on hover
                // colorIconHover: '',

                // --- 2. Hover & Focus States ---
                // Border color of the selector box on hover
                // colorBorderHover: '',
                // Border color of the selector box on focus
                // colorPrimaryHover: '',
                // Outline glow color on focus
                // controlOutline: '',

                // --- 3. Disabled State ---
                // Background color when disabled
                colorBgContainerDisabled: 'rgb(30, 40, 46)',
                // Text color when disabled
                colorTextDisabled: 'rgb(136, 136, 136)',

                // --- 4. Error Validation State (status="error") ---
                // Border color in error state
                // colorError: '',
                // Border color on hover in error state
                // colorErrorHover: '',
                // Outline glow color on focus in error state 
                // colorErrorOutline: '',

                // --- 5. Warning Validation State (status="warning") ---
                // Border color in warning state
                // colorWarning: '',
                // Border color on hover in warning state
                // colorWarningHover: '',
                // Outline glow color on focus in warning state 
                // colorWarningOutline: '',

                // --- 6. Dropdown Menu & Options List ---
                // Background color of the dropdown menu popup
                colorBgElevated: 'rgb(119, 127, 131)',
                // Background color when hovering over an option
                optionActiveBg: 'rgb(163, 163, 163)',
                // Text color of the options in normal state
                optionColor: 'rgb(255, 255, 255)',
                // Background color of the SELECTED option
                optionSelectedBg: 'rgb(0, 0, 0)',
                // Text color of the SELECTED option
                optionSelectedColor: 'rgb(255, 255, 255)',
                // Font weight of the SELECTED option text (e.g., 600 equals Bold)
                optionSelectedFontWeight: 600,

            },
            Button: {
                // --- 1. Primary Button ---
                // Text color of primary button
                primaryColor: 'rgb(255, 255, 255)',
                // Shadow effect of primary button
                primaryShadow: '0 2px 0 rgba(5,145,255,0.1)',
                // Default text color for solid buttons (variant="solid")
                // solidTextColor: '',

                // --- 2. Default Button ---
                // Background color of default button
                defaultBg: 'rgb(136, 136, 136)',
                // Border color of default button
                // defaultBorderColor: '',
                // Text color of default button
                defaultColor: 'rgba(255, 255, 255, 0.88)',
                // Shadow effect of default button
                // defaultShadow: '0 2px 0 rgba(0,0,0,0.02)',

                // --- 3. Default Button - Hover & Active States ---
                // Background color of default button when hovering
                // defaultHoverBg: '',
                // Border color of default button when hovering
                // defaultHoverBorderColor: '',
                // Text color of default button when hovering
                // defaultHoverColor: '',
                // Background color of default button when active (clicked)
                // defaultActiveBg: '',
                // Border color of default button when active (clicked)
                // defaultActiveBorderColor: '',
                // Text color of default button when active (clicked)
                defaultActiveColor: 'rgb(255, 255, 255)',

                // --- 4. Danger Button ---
                // Text color of danger button
                // dangerColor: '',
                // Shadow effect of danger button
                // dangerShadow: '0 2px 0 rgba(255,38,5,0.06)',

                // --- 5. Ghost Button ---
                // Background color of ghost button
                // ghostBg: '',
                // Border color of default ghost button
                // defaultGhostBorderColor: '',
                // Text color of default ghost button
                // defaultGhostColor: '',

                // --- 6. Text Button ---
                // Default text color for text buttons
                // textTextColor: '',
                // Background color of text button when hovering
                // textHoverBg: '',
                // Text color for text buttons on hover
                // textTextHoverColor: '',
                // Text color for text buttons on active
                // textTextActiveColor: '',

                // --- 7. Link Button ---
                // Background color of link button when hovering
                // linkHoverBg: '',

                // --- 8. Disabled State ---
                // Background color of dashed button when disabled
                // dashedBgDisabled: '',
                // Background color of default button when disabled
                defaultBgDisabled: 'rgb(30, 40, 46)',

                // --- 9. Typography & Layout ---
                // Font weight of text
                // fontWeight: 400,
                // Font size of button content
                // contentFontSize: 14,
                // Font size of large button content
                // contentFontSizeLG: 16,
                // Font size of small button content
                // contentFontSizeSM: 14,
                // Gap between icon and text
                // iconGap: 8,
                // Horizontal padding of button
                // paddingInline: 15,
                // Horizontal padding of large button
                // paddingInlineLG: 15,
                // Horizontal padding of small button
                // paddingInlineSM: 7,

                // --- 10. Only Icon Button ---
                // Icon size of button which only contains icon
                // onlyIconSize: '',
                // Icon size of large button which only contains icon
                // onlyIconSizeLG: '',
                // Icon size of small button which only contains icon
                // onlyIconSizeSM: '',
            }


        },
    };

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
    const translation = useTranslation({ providers, defaultProviderId, modelOptions })

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
            <ConfigProvider theme={theme}>
                <Row className="translation-page-content">
                    {/* Title */}
                    <Row style={{ width: '100%', maxWidth: '100%' }}>
                        <Col span={24}>
                            <Typography.Title level={4} className="translation-page-title">
                                Translator
                            </Typography.Title>
                        </Col>
                    </Row>

                    <Row style={{ width: '100%', maxWidth: '100%' }} gutter={[16, 16]}>
                        <Col span={24} lg={{ span: 18, order: 1 }} md={{ order: 2 }} xs={{ order: 2 }}>
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
                        <Col span={24} lg={{ span: 6, order: 2 }} md={{ order: 1 }} xs={{ order: 1 }}>
                            <OptionsPanel
                                key={`${translation.mode}-${translation.category}`}
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
                        </Col>

                    </Row>
                </Row>
            </ConfigProvider>

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