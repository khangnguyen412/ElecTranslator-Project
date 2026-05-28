/* eslint-disable */
import { getRequest } from '@/api/axios';

export const checkHealth = async (): Promise<any> => {
    try {
        return await getRequest('', '/tags', { headers: { 'Content-Type': 'application/json' }, withCredentials: false });
    } catch (error) {
        throw error
    }
}