export type status = 'idle' | 'checking' | 'connected' | 'success' | 'error' | 'missing';

export type startBackend = {
    status: status;
    message?: string;
}

export type CheckStatus = 'waiting' | 'loading' | 'success' | 'error';

export interface CheckItem {
    key: string;
    title: string;
    description: string;
    meta?: string;
    icon: React.ReactNode;
    status: CheckStatus;
    detail?: string;
}