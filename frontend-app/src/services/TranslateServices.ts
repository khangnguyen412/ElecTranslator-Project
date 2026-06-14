/* eslint-disable */
import { getRequest, postRequest } from '@/api/axios';

/**
 * Type
 */
import type { PromptParams } from "@/types/translate.type";

export const OllamaTranslate = async (payload: PromptParams): Promise<any> => {
    try {
        return await postRequest('/ollama/translate', payload, { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (error) {
        throw error
    }
}

export const NormalTranslate = async (payload: { sourceLanguage: string, targetLanguage: string, text: string }): Promise<any> => {
    try {
        const url = `https://lingva.ml/api/v1` ;
        const endpoint = `${payload.sourceLanguage}/${payload.targetLanguage}/${encodeURIComponent(payload.text)}`;
        return await getRequest(endpoint);
    } catch (err) {
        throw err
    }
}
