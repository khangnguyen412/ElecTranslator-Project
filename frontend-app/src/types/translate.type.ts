export interface Prompt {
    model?: string;
    created_at?: string;
    message?: {
        role: string;
        content: string;
    };
}

export interface PromptParams {
    mode: string;
    provider?: string | undefined;
    model?: string | undefined;
    url?: string | undefined;
    api_key?: string | undefined;
    text: string; // Text to translate
    source_lang: string; // ISO 639-1 (ja, en, ko, zh, fr, de...)
    source_code: string; // Code of source language (en, zh, fr, de...)
    target_lang: string; // ISO 639-1 (vi, en, ko, zh, fr, de...)
    target_code: string; // Code of target language (vi, en, zh, fr, de...)
    category?: 'manga' | 'novel' | 'email' | 'subtitles' | 'technical' | 'default' | string | undefined;
    tone?: 'casual' | 'formal' | 'dramatic' | 'comedic' | 'romantic' | 'default' | undefined;
}