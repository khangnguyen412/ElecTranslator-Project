/// <reference types="vite/client" />
interface Window {
    electronAPI: {
        /**
         * Capture Screen   
         */
        captureScreen: () => Promise<{ base64: string; error?: string }>

        /**
         * Check Python dependencies status
         */
        pythonStatus: () => Promise<{ phase: 'idle' | 'starting' | 'installing' | 'ready' | 'error' ; message?: string; lastError?: string; installID?: number}>
        retryInstall: () => Promise<void>
        startBackend: () => Promise<void>

        /**
         * Trigger Translate
         */
        onTriggerCapture: (callback: () => void) => void
        removeTriggerCapture: (callback: () => void) => void

        /**
         * Store
         */
        store: {
            getSetting: () => Promise<StoreType['setting']>
            saveSetting: (setting: StoreType['setting']) => Promise<boolean>
            getHistory: () => Promise<StoreType['history']>
            addHistory: (record: StoreType['history'][0]) => Promise<boolean>
            clearHistory: () => Promise<boolean>
        }

        /**
         * Overlay translation
         */
        showTranslatedText: (title: string, body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }>) => Promise<boolean>;
        onDisplayOverlay: (callback: (data: { title: string; body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }>; }) => void) => void;
        hideOverlay: () => Promise<boolean>;
        copyText: (text: string) => Promise<boolean>;
    }
}
