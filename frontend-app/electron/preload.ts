import { contextBridge, ipcRenderer } from 'electron'
import { Store as StoreType } from './type/store.type'

/**
 * Expose API
 */
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Capture Screen
     */
    captureScreen: () => ipcRenderer.invoke('capture-screen'),

    /**
     * Checking System Status
     */
    checkPythonVersion: () => ipcRenderer.invoke('check-python-version'),
    checkPythonLibraryRequirements: () => ipcRenderer.invoke('check-python-library-requirements'),
    startBackend: () => ipcRenderer.invoke('start-backend'),

    /**
     * Trigger Capture
     */
    onTriggerCapture: (callback: () => void) => {
        ipcRenderer.removeAllListeners('trigger-translate');
        ipcRenderer.on('trigger-translate', callback)
    },
    removeTriggerCapture: (callback: () => void) => ipcRenderer.removeListener('trigger-translate', callback),

    /**
     * Store
     */
    store: {
        getSetting: () => ipcRenderer.invoke('store:get-setting'),
        saveSetting: (setting: StoreType['data']['setting']) => ipcRenderer.invoke('store:save-setting', setting),
        getHistory: () => ipcRenderer.invoke('store:get-history'),
        addHistory: (record: StoreType['data']['history'][0]) => ipcRenderer.invoke('store:add-history', record),
        clearHistory: () => ipcRenderer.invoke('store:clear-history'),
    },

    /**
     * Overlay translation
     */
    showTranslatedText: (title: string, body: string) =>
        ipcRenderer.invoke('show-translated-text', title, body),
    onDisplayOverlay: (callback: (data: { title: string; body: string }) => void) => {
        ipcRenderer.removeAllListeners('display-overlay-translation');
        ipcRenderer.on('display-overlay-translation', (_event, data) => callback(data));
    },
    hideOverlay: () => ipcRenderer.invoke('hide-overlay'),
    copyText: (text: string) => ipcRenderer.invoke('copy-text', text),
})