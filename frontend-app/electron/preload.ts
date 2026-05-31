import { contextBridge, ipcRenderer } from 'electron'

/**
 * Expose API
 */
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Capture Screen
     */
    captureScreen: () => ipcRenderer.invoke('capture-screen'),

    /**
     * OCR Image Python
     */
    ocrImagePython: (base64Data: string, lang: string) => ipcRenderer.invoke('ocr-image-python', base64Data, lang),

    /**
     * Checking System Status
     */
    checkPythonVersion: () => ipcRenderer.invoke('check-python-version'),
    checkPythonLibraryRequirements: () => ipcRenderer.invoke('check-python-library-requirements'),

    /**
     * Trigger Translate
     */
    onTriggerTranslate: (callback: () => void) => ipcRenderer.on('trigger-translate', callback),
    removeTriggerTranslate: (callback: () => void) => ipcRenderer.removeListener('trigger-translate', callback)

})