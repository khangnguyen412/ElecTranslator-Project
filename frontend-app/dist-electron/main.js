"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
/**
 * React Developer Tools
 */
const electron_devtools_installer_1 = require("@tomjs/electron-devtools-installer");
/**
 * Module
 */
const screenshot_1 = require("./module/screenshot/screenshot");
const ocrRead_1 = require("./module/orc/ocrRead");
const serviceCheck_1 = require("./module/checking/serviceCheck");
const serviceStartup_1 = require("./module/checking/serviceStartup");
const store_1 = __importDefault(require("./module/store/store"));
/**
 * Check if application is running in development mode
 */
const isDev = process.env.NODE_ENV === "development";
/**
 * Get setting from store
 */
electron_1.ipcMain.handle('store:get-setting', () => {
    return store_1.default.get('data')['setting'];
});
/**
 * Set setting to store
 */
electron_1.ipcMain.handle('store:save-setting', (event, setting) => {
    const currentSetting = store_1.default.get('data')['setting'];
    store_1.default.set("data.setting", { ...currentSetting, ...setting, });
    return true;
});
/**
 * Get history from store
 */
electron_1.ipcMain.handle('store:get-history', () => {
    return store_1.default.get('data')['history'] || [];
});
/**
 * Set history to store
 */
electron_1.ipcMain.handle('store:add-history', (event, record) => {
    const history = store_1.default.get('data')['history'] || [];
    /**
     * Push new record to the head of history array
     */
    history.unshift(record);
    /**
     * Keep only 50 records
     */
    if (history.length > 50) {
        history.pop();
    }
    store_1.default.set("data.history", history);
    return true;
});
/**
 * Clear history from store
 */
electron_1.ipcMain.handle('store:clear-history', () => {
    store_1.default.set("data.history", []);
    return true;
});
/**
 * Check Python version
 */
electron_1.ipcMain.handle('check-python-version', async () => {
    try {
        const response = await (0, serviceCheck_1.checkPythonVersion)();
        return response;
    }
    catch (error) {
        return error;
    }
});
/**
 * Start backend service
 */
electron_1.ipcMain.handle('start-backend', async () => {
    try {
        await (0, serviceStartup_1.startBackend)();
        return { status: 'success' };
    }
    catch (error) {
        return { status: 'error', message: error };
    }
});
/**
 * Check Python library requirements
 */
electron_1.ipcMain.handle('check-python-library-requirements', async (event) => {
    try {
        const response = await (0, serviceCheck_1.checkPythonLibraryRequirements)();
        return response;
    }
    catch (error) {
        return { message: error };
    }
});
/**
 * OCR image using Python
 */
electron_1.ipcMain.handle('ocr-image-python', async (event, base64Data, lang = "en") => {
    return new Promise((resolve) => {
        const pythonProcess = (0, ocrRead_1.getOrCreatePythonProcess)(lang);
        /**
         * Push resolve function to queue for this language
         */
        ocrRead_1.ocrRequests[lang].push(resolve);
        /**
         * Send base64 data to python process stdin and end with \n (do not use .end())
         * Trim base64 data to remove leading/trailing whitespace and newline characters
         */
        const cleanBase64 = base64Data.trim().replace(/\r?\n|\r/g, "");
        pythonProcess.stdin.write(cleanBase64 + '\n');
    });
});
/**
 * Register capture-screen event
 */
electron_1.ipcMain.handle('capture-screen', async () => {
    try {
        const base64 = await (0, screenshot_1.captureRegionInteractive)();
        return { base64 };
    }
    catch (error) {
        return { error: error.message };
    }
});
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        icon: path_1.default.join(__dirname, "../assets/logo.png"),
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    /**
     * Register shortcut to trigger screenshot translate
     */
    const shortcut = 'Ctrl+Shift+Space';
    electron_1.globalShortcut.register(shortcut, () => {
        win.webContents.send('trigger-translate');
    });
    win.once('ready-to-show', () => {
        /**
         * Show window and maximize it but keep title bar
         */
        win.maximize();
        win.show();
    });
    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
}
electron_1.app.whenReady().then(async () => {
    if (isDev) {
        await (0, electron_devtools_installer_1.installExtension)(electron_devtools_installer_1.REACT_DEVELOPER_TOOLS);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }
    createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.app.on("activate", () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
/**
 * Register Kill all python processes when app quits
 */
electron_1.app.on('will-quit', () => {
    for (const lang in ocrRead_1.pythonProcesses) {
        if (ocrRead_1.pythonProcesses[lang]) {
            ocrRead_1.pythonProcesses[lang].kill();
        }
    }
    (0, serviceStartup_1.setupBackendCleanup)();
});
