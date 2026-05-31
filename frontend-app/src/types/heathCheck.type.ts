export type status = 'idle' | 'checking' | 'connected' | 'success' | 'error' | 'missing';

export type pythonStatus = {
    status: status;
    version?: string;
    message?: string;
}

export type pythonLibStatus = {
    status: status;
    installed?: string[];
    missing?: string[];
    message?: string;
}

export type ollamaStatus = {
    status: status;
    message?: string;
    models?: string[];
}