export interface OCRRequest {
    mode: string;
    provider?: string | undefined;
    model?: string | undefined;
    url?: string;
    api_key?: string;
    base64_text: string;
    ocr_lang: string;
    source_lang: string;
    source_code: string;
    target_lang: string;
    target_code: string;
    category?: string | undefined;
    tone?: string | undefined;
}

export interface OCRResponse {
    success: boolean;
    message?: string;
    data?: {
        source_text: string;
        translated_text: string;
    };
}