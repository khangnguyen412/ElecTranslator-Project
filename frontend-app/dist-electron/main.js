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
const ocr_read_1 = require("./module/orc/ocr-read");
/**
 * Check if application is running in development mode
 */
const isDev = process.env.NODE_ENV === "development";
electron_1.ipcMain.handle('ocr-image-python', async (event, base64Data, lang = "en") => {
    return new Promise((resolve) => {
        const pythonProcess = (0, ocr_read_1.getOrCreatePythonProcess)(lang);
        /**
         * Push resolve function to queue for this language
         */
        ocr_read_1.ocrRequests[lang].push(resolve);
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
    for (const lang in ocr_read_1.pythonProcesses) {
        if (ocr_read_1.pythonProcesses[lang]) {
            ocr_read_1.pythonProcesses[lang].kill();
        }
    }
});
