import axios from 'axios';
import AppConfig from '@/config/app.config';

axios.defaults.withCredentials = true;


// Create axios instance for API requests
export const API = axios.create({
    baseURL: AppConfig.OllamaApiUrl,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Interceptor for API requests
API.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/login')) {
            window.location.href = '/login';
            localStorage.removeItem('profile');
        }
        return Promise.reject(error.response?.data || { errorMessage: "Error" });
    }
);

export const postRequest = (endpoint: string, payload: object = {}, config: object = {}) => {
    return API.post(`${AppConfig.OllamaApiUrl}${endpoint}`, payload, config);
};

export const getRequest = (url: string, endpoint: string, config: object = {}) => {
    return API.get(`${url?url:AppConfig.OllamaApiUrl}${endpoint}`, config);
};

export const putRequest = (endpoint: string, payload: object = {}, config: object = {}) => {
    return API.put(`${AppConfig.OllamaApiUrl}${endpoint}`, payload, config);
};

export const deleteRequest = (endpoint: string, config: object = {}) => {
    return API.delete(`${AppConfig.OllamaApiUrl}${endpoint}`, config);
};

