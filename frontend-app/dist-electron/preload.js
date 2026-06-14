"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * Expose API
 */
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Capture Screen
     */
    captureScreen: () => electron_1.ipcRenderer.invoke('capture-screen'),
    /**
     * OCR Image Python
     * @Deprecated
     */
    ocrImagePython: (base64Data, lang) => electron_1.ipcRenderer.invoke('ocr-image-python', base64Data, lang),
    /**
     * Checking System Status
     */
    checkPythonVersion: () => electron_1.ipcRenderer.invoke('check-python-version'),
    checkPythonLibraryRequirements: () => electron_1.ipcRenderer.invoke('check-python-library-requirements'),
    startBackend: () => electron_1.ipcRenderer.invoke('start-backend'),
    /**
     * Trigger Capture
     */
    onTriggerCapture: (callback) => electron_1.ipcRenderer.on('trigger-translate', callback),
    removeTriggerCapture: (callback) => electron_1.ipcRenderer.removeListener('trigger-translate', callback)
});
