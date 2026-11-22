/// <reference types="vite/client" />
interface Window {
    electronAPI: {
        /**
         * Backend module
         */
        backend: {
            status: () => Promise<{ phase: 'idle' | 'starting' | 'installing' | 'ready' | 'error'; message?: string; lastError?: string; installID?: number }>
            start: () => Promise<void>
            retryInstall: () => Promise<void>
        },

        /**
         * Screenshot module
         */
        screenshot: {
            capture: () => Promise<{ base64: string; error?: string }>
            onTrigger: (callback: () => void) => void
            removeTrigger: (callback: () => void) => void
        },

        /**
         * Store module
         */
        store: {
            getSetting: () => Promise<StoreType['setting']>
            saveSetting: (setting: StoreType['setting']) => Promise<boolean>
            getHistory: () => Promise<StoreType['history']>
            addHistory: (record: StoreType['history'][0]) => Promise<boolean>
            clearHistory: () => Promise<boolean>
        }

        /**
         * Overlay module
         */
        overlay: {
            showText: (title: string, body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }>) => Promise<boolean>;
            onDisplay: (callback: (data: { title: string; body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }>; }) => void) => void;
            onHide: () => Promise<boolean>;
        }

        /**
         * Clipboard module
         */
        clipboard: {
            copy: (text: string) => Promise<boolean>;
        }
    }
}
