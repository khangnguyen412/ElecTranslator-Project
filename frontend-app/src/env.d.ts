/// <reference types="vite/client" />
interface Window {
    electronAPI: {
        captureScreen: () => Promise<{ base64: string; error?: string }>
        ocrImagePython: (base64Data: string, lang: string | string[]) => Promise<{ success: boolean; data?: Array<{ text: string; confidence: number }>; error?: string; }>;
        translateText: (text: string) => Promise<{ translation: string; error?: string }>
        checkOllama: () => Promise<{ available: boolean; error?: string }>
        onTriggerTranslate: (callback: () => void) => void
        removeTriggerTranslate: (callback: () => void) => void
    }
}
