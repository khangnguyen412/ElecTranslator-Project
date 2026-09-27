/* eslint-disable */
import { useState, useCallback } from 'react';

/**
 * Antd
 */
import { message } from 'antd';

/**
 * Service
 */
import { GetSettingService, SaveSettingService } from '@/services/StoreServices';

/**
 * Type
 */
import type { Setting } from '@/types/store.type';

interface UseTranslationSettings {
    // Current value
    defaultOcrLanguage: string;
    defaultSourceLanguage: string | undefined;
    defaultTargetLanguage: string | undefined;
    defaultProviderId: string;
    providers: Setting['provider'];

    // Modal
    settingsPopupVisible: boolean;
    openSettings: () => void;
    closeSettings: () => void;

    // Set value
    setDefaultOcrLanguage: (lang: string) => void;
    setDefaultSourceLanguage: (lang: string | undefined) => void;
    setDefaultTargetLanguage: (lang: string | undefined) => void;
    setDefaultProviderId: (id: string) => void;
    setProviders: React.Dispatch<React.SetStateAction<Setting['provider']>>;

    // Action
    loadSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;
}

export const useTranslationSettings = (): UseTranslationSettings => {
    const [settingsPopupVisible, setSettingsPopupVisible] = useState<boolean>(false);
    const [providers, setProviders] = useState<Setting['provider']>([]);
    const [defaultProviderId, setDefaultProviderId] = useState<string>('');
    const [defaultOcrLanguage, setDefaultOcrLanguage] = useState<string>('');
    const [defaultSourceLanguage, setDefaultSourceLanguage] = useState<string | undefined>(undefined);
    const [defaultTargetLanguage, setDefaultTargetLanguage] = useState<string | undefined>(undefined);

    /** Open settings popup */
    const openSettings = useCallback(() => {
        setSettingsPopupVisible(true);
    }, []);

    /** Close settings popup */
    const closeSettings = useCallback(() => {
        setSettingsPopupVisible(false);
    }, []);

    /** Load settings */
    const loadSettings = useCallback(async () => {
        try {
            const setting = await GetSettingService();
            setProviders(setting.provider || []);
            setDefaultProviderId(setting.default_provider_id || '');
            setDefaultOcrLanguage(setting.default_ocr_language || '');
            setDefaultSourceLanguage(setting.default_source_language);
            setDefaultTargetLanguage(setting.default_target_language);
        } catch (error: any) {
            message.error(`Load fail: ${String(error)}`);
        }
    }, []);

    /** Save settings */
    const saveSettings = useCallback(async () => {
        try {
            // Validation 1: No provider exists at all → block save
            if (!providers || providers.length === 0) {
                message.error('Please add providers first');
                return;
            }

            // Validation 2: Provider exists but no default selected → auto-select first
            let effectiveDefaultProviderId = defaultProviderId;
            let autoSelect = false;
            if (!effectiveDefaultProviderId && providers.length > 0) {
                effectiveDefaultProviderId = providers[0].id;
                setDefaultProviderId(effectiveDefaultProviderId);
                message.info(`No default provider selected. Auto-selecting ${effectiveDefaultProviderId}.`);
                autoSelect = true;
            }

            // Validation 3: Default provider selected but no model selected → block save
            if (effectiveDefaultProviderId && providers.length > 0) {
                const selectedProvider = providers.find(p => p.id === effectiveDefaultProviderId);
                if (!selectedProvider || !selectedProvider.model || selectedProvider.model.length === 0) {
                    message.error("Please add at least one model to the selected provider before saving.");
                    return;
                }
            }

            await SaveSettingService({
                provider: providers,
                default_provider_id: effectiveDefaultProviderId,
                default_ocr_language: defaultOcrLanguage,
                default_source_language: defaultSourceLanguage,
                default_target_language: defaultTargetLanguage,
            });
            
            closeSettings();
            if (!autoSelect) {
                message.success('Settings saved!');
            }
        } catch (error) {
            message.error(`Save failed: ${error}`);
        }
    }, [providers, defaultProviderId, defaultOcrLanguage, defaultSourceLanguage, defaultTargetLanguage, closeSettings]);

    return {
        defaultOcrLanguage,
        defaultSourceLanguage,
        defaultTargetLanguage,
        defaultProviderId,
        providers,

        settingsPopupVisible,
        openSettings,
        closeSettings,

        setDefaultOcrLanguage,
        setDefaultSourceLanguage,
        setDefaultTargetLanguage,
        setDefaultProviderId,
        setProviders,

        loadSettings,
        saveSettings,
    };
}
