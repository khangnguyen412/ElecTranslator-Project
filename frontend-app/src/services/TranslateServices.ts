/* eslint-disable */
import { postRequest } from '@/api/axios';

/**
 * Type
 */
import type { TranslateParams } from "@/types/translate.type";

export const AITranslate = async (payload: TranslateParams): Promise<any> => {
    try {
        return await postRequest('/ai/translate', payload, { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (error) {
        throw error
    }
}

export const NormalTranslate = async (payload: TranslateParams): Promise<any> => {
    try {
        // const url = `https://lingva.ml/api/v1` ;
        // const endpoint = `${payload.sourceLanguage}/${payload.targetLanguage}/${encodeURIComponent(payload.text)}`;
        return await postRequest('/translate', payload, { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (err) {
        throw err
    }
}
