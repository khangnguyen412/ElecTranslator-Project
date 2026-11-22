import { contextBridge, ipcRenderer } from 'electron'
import { Store as StoreType } from './type/store.type'

/**
 * Expose API
 */
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Backend module
     */
    backend: {
        status: () => ipcRenderer.invoke('backend:status'),
        start: () => ipcRenderer.invoke('backend:start'),
        retryInstall: () => ipcRenderer.invoke('backend:retry-install'),
    },

    /**
     * Screenshot module
     */
    screenshot: {
        capture: () => ipcRenderer.invoke('screenshot:capture'),
        onTrigger: (callback: () => void) => {
            ipcRenderer.removeAllListeners('screenshot:trigger');
            ipcRenderer.on('screenshot:trigger', callback)
        },
        removeTrigger: (callback: () => void) => ipcRenderer.removeListener('screenshot:trigger', callback),
    },

    /**
     * Store module
     */
    store: {
        getSetting: () => ipcRenderer.invoke('store:get-setting'),
        saveSetting: (setting: StoreType['data']['setting']) => ipcRenderer.invoke('store:save-setting', setting),
        getHistory: () => ipcRenderer.invoke('store:get-history'),
        addHistory: (record: StoreType['data']['history'][0]) => ipcRenderer.invoke('store:add-history', record),
        clearHistory: () => ipcRenderer.invoke('store:clear-history'),
    },

    /**
     * Overlay module
     */
    overlay:{
        showText: (title: string, body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }>) => ipcRenderer.invoke('overlay:show-text', title, body),
        onDisplay: (callback: (data: { title: string; body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }> | undefined }) => void) => {
            ipcRenderer.removeAllListeners('overlay:display');
            ipcRenderer.on('overlay:display', (_event, data) => callback(data));
        },
        onHide: () => ipcRenderer.invoke('overlay:hide'),
    },

    /**
     * Clipboard module
     */
    clipboard: {
        copy: (text: string) => ipcRenderer.invoke('clipboard:copy', text),
    }
})