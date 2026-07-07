/// <reference types="vite/client" />
interface Window {
    electronAPI: {
        /**
         * Capture Screen   
         */
        captureScreen: () => Promise<{ base64: string; error?: string }>

        /**
         * Check Python Version
         */
        checkPythonVersion: () => Promise<{ status: status; version?: string; message?: string; }>
        checkPythonLibraryRequirements: () => Promise<{ status: status; installed?: string[]; missing?: string[]; message?: string; }>
        startBackend: () => Promise<void>

        /**
         * OCR Image Python
         */
        ocrImagePython: (base64Data: string, lang: string | string[]) => Promise<{ success: boolean; data?: Array<{ text: string; confidence: number }>; error?: string; }>;

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
    }
}
