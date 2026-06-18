/* eslint-disable */
import { postRequest } from '@/api/axios';

/**
 * Type
 */
import type { OCRRequest } from '@/types/ocr.type';

export const orcService = async (data: OCRRequest): Promise<any> => {
    try {
        return await postRequest('/ocr', data, { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (error) {
        throw error
    }
}