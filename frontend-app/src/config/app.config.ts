export default class AppConfig {
    /**
     * Get variables from Vite environment
     * Note: Variables must start with VITE_ to expose
     */
    static readonly API_HOST: string = import.meta.env.VITE_API_HOST || 'localhost';
    static readonly API_PORT: string = import.meta.env.VITE_API_PORT || '4120';

    /**
     * Get URL API backend
     */
    static get ApiUrl() {
        return `http://${AppConfig.API_HOST}:${AppConfig.API_PORT}/api`;
    }
}