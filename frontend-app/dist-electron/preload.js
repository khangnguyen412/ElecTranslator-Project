"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * Expose API
 */
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    captureScreen: () => electron_1.ipcRenderer.invoke('capture-screen'),
    ocrImagePython: (base64Data, lang) => electron_1.ipcRenderer.invoke('ocr-image-python', base64Data, lang),
    onTriggerTranslate: (callback) => {
        electron_1.ipcRenderer.on('trigger-translate', callback);
    },
    removeTriggerTranslate: (callback) => {
        electron_1.ipcRenderer.removeListener('trigger-translate', callback);
    }
});
