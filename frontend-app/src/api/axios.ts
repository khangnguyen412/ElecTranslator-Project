import axios from 'axios';
import AppConfig from '@/config/app.config';

axios.defaults.withCredentials = true;


// Create axios instance for API requests
export const API = axios.create({
    baseURL: AppConfig.ApiUrl,
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
        return Promise.reject(error.response?.data || { errors: "Error" });
    }
);

export const postRequest = (endpoint: string, payload: object = {}, config: object = {}) => {
    return API.post(`${AppConfig.ApiUrl}${endpoint}`, payload, config);
};

export const getRequest = (endpoint: string, config: object = {}) => {
    return API.get(`${AppConfig.ApiUrl}${endpoint}`, config);
};

export const putRequest = (endpoint: string, payload: object = {}, config: object = {}) => {
    return API.put(`${AppConfig.ApiUrl}${endpoint}`, payload, config);
};

export const deleteRequest = (endpoint: string, config: object = {}) => {
    return API.delete(`${AppConfig.ApiUrl}${endpoint}`, config);
};

