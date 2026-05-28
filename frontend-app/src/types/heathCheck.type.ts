export type OllamaStatus = 'idle' | 'checking' | 'connected' | 'error' | 'model_missing';
export interface HealthCheckPayload {
    model?: [];
}