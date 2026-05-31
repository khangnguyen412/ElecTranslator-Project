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

        /**
         * OCR Image Python
         */
        ocrImagePython: (base64Data: string, lang: string | string[]) => Promise<{ success: boolean; data?: Array<{ text: string; confidence: number }>; error?: string; }>;

        /**
         * Trigger Translate
         */
        onTriggerTranslate: (callback: () => void) => void
        removeTriggerTranslate: (callback: () => void) => void
    }
}
