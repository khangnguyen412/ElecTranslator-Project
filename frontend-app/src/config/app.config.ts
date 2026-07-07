export default class AppConfig {
    // Get variables from Vite environment
    // Note: Variables must start with VITE_ to expose
    static readonly APIEndpoint: string = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    /**
     * Get URL API backend
     */
    static get ApiUrl() {
        return AppConfig.APIEndpoint + '/api';
    }
}