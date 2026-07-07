/* eslint-disable */

export const GetSettingService = async () => {
    return await window.electronAPI.store.getSetting()
}

export const SaveSettingService = async (setting: any) => {
    return await window.electronAPI.store.saveSetting(setting)
}

export const GetHistoryService = async () => {
    return await window.electronAPI.store.getHistory()
}

export const AddHistoryService = async (source: string, target: string) => {
    const record = {
        id: Date.now().toString(),
        source_text: source,
        target_text: target,
        timestamp: Date.now(),
    }
    return await window.electronAPI.store.addHistory(record)
}

export const ClearHistoryService = async () => {
    return await window.electronAPI.store.clearHistory()
}