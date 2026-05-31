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
     */
    ocrImagePython: (base64Data, lang) => electron_1.ipcRenderer.invoke('ocr-image-python', base64Data, lang),
    /**
     * Checking System Status
     */
    checkPythonVersion: () => electron_1.ipcRenderer.invoke('check-python-version'),
    checkPythonLibraryRequirements: () => electron_1.ipcRenderer.invoke('check-python-library-requirements'),
    /**
     * Trigger Translate
     */
    onTriggerTranslate: (callback) => electron_1.ipcRenderer.on('trigger-translate', callback),
    removeTriggerTranslate: (callback) => electron_1.ipcRenderer.removeListener('trigger-translate', callback)
});
