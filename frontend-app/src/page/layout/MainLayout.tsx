/* eslint-disable */
import React, { useEffect, useContext } from 'react';

/**
 * Ant Design
 */
import { Layout, Typography, Row, Col, Space, Button, ConfigProvider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

/**
 * Config
 */
import { themeConfig } from "@/config/theme.config";

/**
 * Logo
 */
import logo from "@/assets/logo.png";

/**
 * Styles
 */
import "@/assets/scss/layout/main.scss";

/**
 * Component
 */
import { AdvancedSettingsModal } from '@/components/translation/AdvancedSettingsModal';

/**
 * Hook
 */
import { useTranslationSettings } from "@/hook/useTranslationSettings";

const SettingsContext = React.createContext<ReturnType<typeof useTranslationSettings> | null>(null);
export const useAppSettings = () => useContext(SettingsContext)!;

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    /**
     * Hook
     */
    const settings = useTranslationSettings();
    const {
        defaultOcrLanguage, defaultSourceLanguage, defaultTargetLanguage, defaultProviderId, providers, settingsPopupVisible,
        setDefaultOcrLanguage, setDefaultSourceLanguage, setDefaultTargetLanguage, setDefaultProviderId, setProviders,
        loadSettings, saveSettings, openSettings, closeSettings,
    } = settings;

    /**
     * Handle load settings
     */
    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <React.Fragment>
            <SettingsContext.Provider value={settings}>
                <ConfigProvider theme={themeConfig}>
                    <Layout className="main-layout">
                        <Layout.Header className="main-header">
                            <Row justify="space-between" align="middle" className="main-header-row">
                                <Col>
                                    <Space>
                                        <div className="logo-box">
                                            <img src={logo} alt="logolecTranslator" className="logo-img" />
                                        </div>
                                        <Typography.Text strong className="app-title">ElecTranslator</Typography.Text>
                                    </Space>
                                </Col>
                                <Col className="main-header-actions">
                                    <Button icon={<SettingOutlined />} onClick={() => openSettings()} className="options-panel-advanced-btn" ></Button>
                                </Col>
                            </Row>
                        </Layout.Header>

                        <Layout.Content className="main-content">
                            {children}
                        </Layout.Content>

                        <Layout.Footer className="main-footer">
                            UI/UX Framework: <Typography.Text strong className="footer-highlight">ReactJS + Ant Design v6</Typography.Text>
                        </Layout.Footer>
                    </Layout>

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
                </ConfigProvider>
            </SettingsContext.Provider>
        </React.Fragment>
    );
};
export default MainLayout;