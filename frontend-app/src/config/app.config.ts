export default class AppConfig {
    // Get variables from Vite environment
    // Note: Variables must start with VITE_ to expose
    static readonly ollamaEndpoint: string = import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434';
    static readonly defaultModel: string = import.meta.env.VITE_OLLAMA_MODEL_NAME || 'gemma3';

    /**
     * Get URL API của Ollama
     */
    static get OllamaApiUrl() {
        return AppConfig.ollamaEndpoint + '/api';
    }

    /**
     * Get Default Model Name
     */
    static get DefaultModel() {
        return AppConfig.defaultModel;
    }
}