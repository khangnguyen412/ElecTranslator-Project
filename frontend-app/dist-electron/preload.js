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
     * Checking System Status
     */
    checkPythonVersion: () => electron_1.ipcRenderer.invoke('check-python-version'),
    checkPythonLibraryRequirements: () => electron_1.ipcRenderer.invoke('check-python-library-requirements'),
    startBackend: () => electron_1.ipcRenderer.invoke('start-backend'),
    /**
     * Trigger Capture
     */
    onTriggerCapture: (callback) => electron_1.ipcRenderer.on('trigger-translate', callback),
    removeTriggerCapture: (callback) => electron_1.ipcRenderer.removeListener('trigger-translate', callback),
    /**
     * Store
     */
    store: {
        getSetting: () => electron_1.ipcRenderer.invoke('store:get-setting'),
        saveSetting: (setting) => electron_1.ipcRenderer.invoke('store:save-setting', setting),
        getHistory: () => electron_1.ipcRenderer.invoke('store:get-history'),
        addHistory: (record) => electron_1.ipcRenderer.invoke('store:add-history', record),
        clearHistory: () => electron_1.ipcRenderer.invoke('store:clear-history'),
    }
});
