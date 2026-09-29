export interface OCRRequest {
    base64_text: string;
    ocr_lang: string;
}

export interface OCRResponse {
    success: boolean;
    message?: string;
    data?: {
        source_text: string;
    };
}