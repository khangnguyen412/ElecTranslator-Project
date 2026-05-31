export default class AppConfig {
    // Get variables from Vite environment
    // Note: Variables must start with VITE_ to expose
    static readonly ollamaEndpoint: string = import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434';

    /**
     * Get URL API của Ollama
     */
    static get OllamaApiUrl() {
        return AppConfig.ollamaEndpoint + '/api';
    }
}