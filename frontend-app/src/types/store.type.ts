export type Setting = {
    provider: Array<{
        id: 'OpenAI',
        name: 'OpenAI',
        type: 'cloud' | 'local';
        api_key: string,
        base_url: string,
        model: Array<string>;
    }>;
    default_provider_id: string;
    default_ocr_language: string;
    default_source_language: string | undefined;
    default_target_language: string | undefined;
}

export type History = {
    id?: string;
    source_text: string;
    target_text: string;
    created_at?: string;
}
