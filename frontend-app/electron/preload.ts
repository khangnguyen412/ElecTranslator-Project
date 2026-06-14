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
     * @Deprecated
     */
    ocrImagePython: (base64Data: string, lang: string) => ipcRenderer.invoke('ocr-image-python', base64Data, lang),

    /**
     * Checking System Status
     */
    checkPythonVersion: () => ipcRenderer.invoke('check-python-version'),
    checkPythonLibraryRequirements: () => ipcRenderer.invoke('check-python-library-requirements'),
    startBackend: () => ipcRenderer.invoke('start-backend'),

    /**
     * Trigger Capture
     */
    onTriggerCapture: (callback: () => void) => ipcRenderer.on('trigger-translate', callback),
    removeTriggerCapture: (callback: () => void) => ipcRenderer.removeListener('trigger-translate', callback)

})