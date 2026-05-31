/* eslint-disable */
import { getRequest, postRequest } from '@/api/axios';

/**
 * Type
 */
import type { Prompt } from "@/types/translate.type";

export const OllamaTranslate = async (payload: Prompt): Promise<any> => {
    try {
        return await postRequest('/chat', payload, { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (error) {
        throw error
    }
}

export const NormalTranslate = async (payload: { sourceLanguage: string, targetLanguage: string, text: string }): Promise<any> => {
    try {
        const url = `https://lingva.ml/api/v1` ;
        const endpoint = `${payload.sourceLanguage}/${payload.targetLanguage}/${encodeURIComponent(payload.text)}`;
        return await getRequest(url, endpoint);
    } catch (err) {
        throw err
    }
}
