/* eslint-disable */
import { getRequest } from '@/api/axios';

export const backendCheck = async (): Promise<any> => {
    try {
        return await getRequest('/health', { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (error) {
        throw error
    }
}

export const ollamaCheck = async (): Promise<any> => {
    try {
        return await getRequest('/ollama/status', { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (error) {
        throw error
    }
}