/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Ant Design
 */
import { Input, Button, Space, Typography, message, Row, Col, Select } from 'antd';
import { CopyOutlined, CameraOutlined, SettingOutlined, TranslationOutlined } from '@ant-design/icons';

/**
 * Redux
 */
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { requestOllamaThunk } from '@/redux/features/translate';

/**
 * Type
 */
import type { PromptParams } from "@/types/translate.type";

/**
 * Config
 */
import { getLangCodeByLang, getOcrCodeByLang, getLangNameByLang } from "@/config/language.config";

interface TranslationPanelProps {
    defaultTranslate?: boolean;
}

const TranslationPanelPage: React.FC<TranslationPanelProps> = ({ defaultTranslate = false }) => {
    const [sourceLang, setSourceLang] = useState<string | undefined>(undefined);
    const [targetLang, setTargetLang] = useState<string | undefined>(undefined);
    const [sourceText, setSourceText] = useState<string>('');
    const [resultText, setResultText] = useState<string>('');
    const [category, setCategory] = useState<string | undefined>('default');
    const [tone, setTone] = useState<PromptParams['tone'] | undefined>(undefined);
    const [isOcrTriggered, setIsOcrTriggered] = useState<boolean>(false);
    const [translating, setTranslating] = useState<boolean>(false);
    const [translatingOCR, setTranslatingOCR] = useState<boolean>(false);

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
            if (!sourceLang || !targetLang || !category) {
                throw new Error("Please select source, target.");
            }
            const result = await window.electronAPI.captureScreen();
            if (result.error) {
                throw new Error(result.error);
            }
            const ocrResult: any = await window.electronAPI.ocrImagePython(result.base64, [getOcrCodeByLang(sourceLang || '')?.orcCode || 'en']);

            // check ocrResult is valid
            if (!ocrResult || ocrResult.success === false || ocrResult.error) {
                throw new Error(ocrResult?.error || "Failed to process OCR result.");
            }

            // extract text from ocrResult.text
            const extractedText = ocrResult.text;
            if (!extractedText || !extractedText.trim()) {
                throw new Error("Failed to extract text from image.");
            }

            setSourceText(extractedText);

            // Set ocrText state with extractedText
            const requestParams: PromptParams = {
                text_type: category || 'default',
                tone: tone || 'casual',
                source_lang: getLangNameByLang(sourceLang || '')?.langName || 'English',
                source_code: getLangCodeByLang(sourceLang || '')?.langCode || 'en',
                target_lang: getLangNameByLang(targetLang || '')?.langName || 'Vietnamese',
                target_code: getLangCodeByLang(targetLang || '')?.langCode || 'vi',
                source_text: extractedText || '',
            }
            const response = await dispatch(requestOllamaThunk({ promptParams: requestParams})).unwrap();
            setResultText(response.data?.message?.content || '');
            message.success('Translation successful!');
        } catch (error: any) {
            message.error(`Translation error: ${error.message}`);
        } finally {
            setTranslatingOCR(false);
        }
    }, [dispatch, category, tone, sourceLang, targetLang]);

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
            const requestParams: PromptParams = {
                text_type: category || 'default',
                tone: tone || 'casual',
                source_lang: getLangNameByLang(sourceLang || '')?.langName || 'English',
                source_code: getLangCodeByLang(sourceLang || '')?.langCode || 'en',
                target_lang: getLangNameByLang(targetLang || '')?.langName || 'Vietnamese',
                target_code: getLangCodeByLang(targetLang || '')?.langCode || 'vi',
                source_text: sourceText || '',
            }
            const response = await dispatch(requestOllamaThunk({ promptParams: requestParams})).unwrap();
            setResultText(response.data?.message?.content || '');
            message.success('Translation successful!');
        }
        catch (error: any) {
            message.error(`Translation error: ${error.message}`);
        }
        finally {
            setTranslating(false);
        }
    }, [dispatch, category, tone, sourceLang, targetLang, sourceText]);

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
        options: [
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
        style: { width: '100%', marginTop: 8 },
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
        window.electronAPI?.onTriggerTranslate(handler);
        return () => {
            window.electronAPI?.removeTriggerTranslate(handler);
        };
    }, []);

    useEffect(() => {
        if (isOcrTriggered && sourceText && sourceText.trim() !== '') {
            handleORCTranslate();
            setIsOcrTriggered(false);
        }
    }, [sourceText, handleORCTranslate]);

    return (
        <React.Fragment>
            <Row style={{ width: '100%', maxWidth: '100%', margin: '20px auto' }}>
                {/* Title */}
                <Col span={24} style={{ padding: 20 }}>
                    <Typography.Title level={4} style={{ margin: 0, textAlign: 'center' }}>
                        AI Translator
                    </Typography.Title>
                </Col>
                <Col span={24}>
                    {/* Translation Settings */}
                    <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 12 }}>
                        <Typography.Text strong style={{ marginBottom: 12, display: 'block' }}>
                            <SettingOutlined style={{ marginRight: 6 }} /> Translation Settings
                        </Typography.Text>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={6}>
                                <Typography.Text strong>Source Language</Typography.Text>
                                <Select {...sourceLangConfig} />
                            </Col>
                            <Col xs={24} sm={6}>
                                <Typography.Text strong>Target Language</Typography.Text>
                                <Select {...targetLangConfig} />
                            </Col>
                            <Col xs={24} sm={6}>
                                <Typography.Text strong>Category</Typography.Text>
                                <Select {...textTypeConfig} />
                            </Col>
                            {/* Show Comic Genre when Category is Comic / Manga */}
                            {['comic', 'novel', 'manga', 'manhwa', 'manhua'].includes(category || '') && (
                                <Col xs={24} sm={6}>
                                    <Typography.Text strong>Comic Genre</Typography.Text>
                                    <Select {...toneConfig} />
                                </Col>
                            )}
                        </Row>
                    </div>
                </Col>
            </Row>
            <Row style={{ width: '100%', maxWidth: '100%', margin: '20px auto' }} gutter={[16, 16]}>
                <Col span={24}>
                    {/* Input OCR */}
                    <Typography.Text strong>Input Text - {getLangNameByLang(sourceLang || '')?.langName || sourceLang}</Typography.Text>
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
                <Col span={24}>
                    <Typography.Text strong>Translation Result - {getLangNameByLang(targetLang || '')?.langName || targetLang}</Typography.Text>
                    <Input.TextArea rows={8} value={resultText} readOnly placeholder={translating || translatingOCR ? "Translating..." : "Translation will appear here"} style={{ fontFamily: 'monospace', marginTop: 8, background: '#fafafa', fontSize: 18 }} />
                    <Row justify="start" align="middle" style={{ marginTop: 8 }}>
                        <Space wrap={true}>
                            <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(resultText, 'translated')} disabled={!resultText} style={{ marginTop: 8 }}                >
                                Copy
                            </Button>
                        </Space>
                    </Row>
                </Col>
            </Row>

        </React.Fragment>
    );

};

export default TranslationPanelPage;