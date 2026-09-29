/* eslint-disable */
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Antd
 */
import { message } from 'antd';
import type { SelectProps } from 'antd';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import { requestOCRThunk } from '@/redux/features/ocr';
import { AITranslateThunk, NormalTranslateThunk } from '@/redux/features/translate';
import type { AppDispatch } from '@/redux/store';


/**
 * Service
 */

/**
 * Config
 */
import { getLangNameByLang, getLangCodeByLang, getOcrCodeByLang } from '@/config/language.config';
import { SOURCE_LANG_OPTIONS, SOURCE_LANG_OPTIONS_AI, TARGET_LANG_OPTIONS, MODE_OPTIONS, CATEGORY_OPTIONS, TONE_OPTIONS } from '@/config/translationOptions.config';

/**
 * Type
 */
import type { OCRRequest, OCRResponse } from '@/types/ocr.type';
import type { TranslateParams, TranslateResponse } from '@/types/translate.type';

interface ProviderInfo {
    providers: any[]
    defaultProviderId: string;
    modelOptions: { value: string, label: string }[];
}

interface BuildBaseParams {
    mode: string;
    source_lang: string;
    source_code: string;
    target_lang: string;
    target_code: string;
}

interface UseTranslation {
    sourceText: string;
    resultText: string;
    translating: boolean;
    translatingOCR: boolean;
    mode: string | undefined;
    model: string | undefined;
    sourceLang: string | undefined;
    targetLang: string | undefined;
    category: string | undefined;
    tone: TranslateParams['tone'] | undefined;
    setSourceText: React.Dispatch<React.SetStateAction<string>>;
    setMode: React.Dispatch<React.SetStateAction<string | undefined>>;
    setModel: React.Dispatch<React.SetStateAction<string | undefined>>;
    setSourceLang: React.Dispatch<React.SetStateAction<string | undefined>>;
    setTargetLang: React.Dispatch<React.SetStateAction<string | undefined>>;
    setCategory: React.Dispatch<React.SetStateAction<string | undefined>>;
    setTone: React.Dispatch<React.SetStateAction<TranslateParams['tone'] | undefined>>;
    handleTranslate: () => void;
    handleTranslateOCR: () => void;
    handleClear: () => void;
    handleCopyToClipboard: (text: string, type: 'ocr' | 'translated') => void;
    modeConfig: SelectProps<any>;
    modelConfig: SelectProps<any>;
    sourceLangConfig: SelectProps<any>;
    targetLangConfig: SelectProps<any>;
    categoryConfig: SelectProps<any>;
    toneConfig: SelectProps<any>;
}

export const useTranslation = (providerInfo?: ProviderInfo): UseTranslation => {
    /**
     * State
     */
    const [sourceText, setSourceText] = useState<string>('');
    const [resultText, setResultText] = useState<string>('');
    const [translating, setTranslating] = useState<boolean>(false);
    const [translatingOCR, setTranslatingOCR] = useState<boolean>(false);
    const [mode, setMode] = useState<string | undefined>('AI');
    const [model, setModel] = useState<string | undefined>(undefined);
    const [sourceLang, setSourceLang] = useState<string | undefined>(undefined);
    const [targetLang, setTargetLang] = useState<string | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>('default');
    const [tone, setTone] = useState<TranslateParams['tone'] | undefined>(undefined);

    /**
     * Hook
     */
    const ocrProcessingRef = useRef<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();

    /**
     * Handle clear
     */
    const handleClear = useCallback(() => {
        setSourceText('');
        setResultText('');
    }, []);

    /**
     * Handle copy to clipboard
     */
    const handleCopyToClipboard = useCallback((text: string, type: 'ocr' | 'translated') => {
        navigator.clipboard.writeText(text);
        message.success(`Copied ${type === 'ocr' ? 'original text' : 'translated text'}`);
    }, []);

    /**
     * Build base params
     */
    const buildBaseParams = (): BuildBaseParams => ({
        mode: mode || 'Normal',
        source_lang: getLangNameByLang(sourceLang || '')?.langName || 'English',
        source_code: getLangCodeByLang(sourceLang || '')?.langCode || 'en',
        target_lang: getLangNameByLang(targetLang || '')?.langName || 'Vietnamese',
        target_code: getLangCodeByLang(targetLang || '')?.langCode || 'vi',
    })

    /**
     * Get provider info from params - don't hardcode URL/key in hook
     */
    const getAIProviderParams = (): Partial<TranslateParams> => {
        const p = providerInfo?.providers.find((item) => item.id === providerInfo?.defaultProviderId);
        return {
            provider: p?.id || 'ollama',
            model: model || 'translategemma:12b',
            url: p?.base_url || 'http://localhost:11434',
            api_key: p?.api_key || '',
            category: category || 'default',
            tone: tone || 'casual',
        };
    }

    /**
     * Handle translate
     */
    const handleTranslate = useCallback(async () => {
        setTranslating(true);
        setResultText('');
        try {
            if (!sourceLang || !targetLang || !category) {
                throw new Error('Please select source language, target language, and category');
            }
            /**
             * Hide overlay before translate
             */
            await window.electronAPI.hideOverlay();
            let response: TranslateResponse;
            if (mode === 'Normal') {
                response = await dispatch(NormalTranslateThunk({ ...buildBaseParams(), text: sourceText, })).unwrap();
            } else {
                response = await dispatch(AITranslateThunk({ ...getAIProviderParams(), ...buildBaseParams(), text: sourceText, })).unwrap();
            }
            setResultText(response.translated_text);
            await window.electronAPI.showTranslatedText('Translation Completed', [
                { text: sourceText || '', type: 'source' },
                { text: response.translated_text || '', type: 'translated' },
            ]);
            message.success('Translation successful!');
        } catch (err: any) {
            message.error(`Translation failed: ${err.message}`);
            await window.electronAPI.showTranslatedText('Translation Failed', [
                { text: err.message || '', type: 'error' },
            ]);
        } finally {
            setTranslating(false);
        }
    }, [dispatch, mode, model, sourceText, sourceLang, targetLang, category, tone, providerInfo])

    /**
     * Handle translate OCR
     */
    const handleTranslateOCR = useCallback(async () => {
        if (ocrProcessingRef.current) return;
        ocrProcessingRef.current = true;
        setTranslatingOCR(true);
        handleClear();
        try {
            if (!sourceLang || !targetLang || !model) {
                throw new Error('Please select source language, target language, and model');
            }

            /**
             * Hide overlay before capture
             */
            await window.electronAPI.hideOverlay();
            
            const result = await window.electronAPI.captureScreen();
            if (result.error) {
                throw new Error(result.error);
            }

            let ocrRequestParams: OCRRequest;
            ocrRequestParams = {
                base64_text: result.base64,
                ocr_lang: getOcrCodeByLang(sourceLang || '')?.ocrCode || 'en',
            }
            const ocrResult: OCRResponse = await dispatch(requestOCRThunk(ocrRequestParams)).unwrap();

            /**
             * return source text from ocrResult.text
             */
            if (!ocrResult?.data?.source_text || ocrResult?.data?.source_text.trim() === '') {
                throw new Error(ocrResult?.message || "Failed to process OCR.");
            }
            setSourceText(ocrResult.data.source_text || '');

            /**
             * return translated text from ocrResult.text
             */
            let response: TranslateResponse;
            if (mode === 'Normal') {
                response = await dispatch(NormalTranslateThunk({ ...buildBaseParams(), text: ocrResult.data.source_text })).unwrap();
            } else {
                response = await dispatch(AITranslateThunk({ ...getAIProviderParams(), ...buildBaseParams(), text: ocrResult.data.source_text })).unwrap();
            }

            if (!response?.translated_text) {
                throw new Error("Failed to process translation.");
            }
            setResultText(response.translated_text);
            await window.electronAPI.showTranslatedText('Translation Completed', [
                { text: ocrResult.data.source_text || '', type: 'source' },
                { text: response.translated_text || '', type: 'translated' },
            ]);
            message.success('Translation successful!');
        } catch (err: any) {
            message.error(`Translation failed: ${err.message}`);
            await window.electronAPI.showTranslatedText('Translation Failed', [
                { text: err.message || '', type: 'error' },
            ]);
        } finally {
            setTranslatingOCR(false);
            ocrProcessingRef.current = false;
        }
    }, [dispatch, mode, model, sourceText, sourceLang, targetLang, category, tone, handleClear, providerInfo])

    /**
     * Source language config
     */
    const sourceLangConfig = {
        value: sourceLang,
        onChange: setSourceLang,
        style: { width: '100%', marginTop: 8 },
        options: mode === "Normal" ? SOURCE_LANG_OPTIONS : SOURCE_LANG_OPTIONS_AI,
        placeholder: 'Select Source Language',
    };

    /**
     * Target language config
     */
    const targetLangConfig = {
        value: targetLang,
        onChange: setTargetLang,
        style: { width: '100%', marginTop: 8 },
        options: TARGET_LANG_OPTIONS,
        placeholder: 'Select Target Language',
    };

    /**
     * Mode config
     */
    const modeConfig = {
        value: mode,
        onChange: setMode,
        style: { width: '100%', marginTop: 8 },
        options: MODE_OPTIONS,
        placeholder: 'Select Mode',
    };

    /**
     * Model config
     */
    const modelConfig = {
        value: model,
        onChange: setModel,
        style: { width: '100%', marginTop: 8 },
        options: providerInfo?.modelOptions || [],
        placeholder: 'Select Model',
    };

    /**
     * Category config
     */
    const categoryConfig = {
        value: category,
        onChange: setCategory,
        style: { width: '100%', marginTop: 8 },
        options: CATEGORY_OPTIONS,
        placeholder: 'Select Category',
    };

    /**
     * Tone config
     */
    const toneConfig = {
        value: tone,
        onChange: setTone,
        style: { width: '100%', marginTop: 8 },
        options: TONE_OPTIONS,
        placeholder: 'Select Tone',
    };

    /**
     * Capture screen effect
     */
    const handleRef = useRef(handleTranslateOCR);
    handleRef.current = handleTranslateOCR;

    useEffect(() => {
        const handler = () => handleRef.current();
        window.electronAPI?.onTriggerCapture(handler);
        return () => window.electronAPI?.removeTriggerCapture(handler);
    }, [])

    return {
        sourceText, resultText, translating, translatingOCR,
        mode, model, sourceLang, targetLang, category, tone,
        setSourceText, setMode, setModel, setSourceLang, setTargetLang, setCategory, setTone,
        handleTranslate, handleTranslateOCR, handleClear, handleCopyToClipboard,
        modeConfig, modelConfig, sourceLangConfig, targetLangConfig, categoryConfig, toneConfig,
    }
}
