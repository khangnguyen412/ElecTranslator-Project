import { contextBridge, ipcRenderer } from 'electron'

/**
 * Expose API
 */
contextBridge.exposeInMainWorld('electronAPI', {
    captureScreen: () => ipcRenderer.invoke('capture-screen'),
    ocrImagePython: (base64Data: string, lang: string) => ipcRenderer.invoke('ocr-image-python', base64Data, lang),
    onTriggerTranslate: (callback: () => void) => {
        ipcRenderer.on('trigger-translate', callback);
    },
    removeTriggerTranslate: (callback: () => void) => {
        ipcRenderer.removeListener('trigger-translate', callback);
    }
})