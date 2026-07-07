export interface Store {
    data: {
        setting: {
            provider: Array<{
                id: string;
                name: string;
                type: 'cloud' | 'local';
                api_key: string;
                base_url: string;
                model?: Array<string>;
            }>;
            default_provider_id: string;
            default_ocr_language: string;
            default_source_language: string | undefined;
            default_target_language: string | undefined;
        },
        history: Array<{
            id: string;
            source_text: string;
            target_text: string;
            timestamp: string;
        }>
    };
}