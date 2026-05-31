/* eslint-disable */
import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import path from "path";

/**
 * React Developer Tools
 */
import { installExtension, REACT_DEVELOPER_TOOLS } from '@tomjs/electron-devtools-installer'

/**
 * Module
 */
import { captureRegionInteractive } from './module/screenshot/screenshot'
import { pythonProcesses, ocrRequests, getOrCreatePythonProcess } from "./module/orc/ocrRead";
import { checkPythonVersion, checkPythonLibraryRequirements } from "./module/checking/serviceCheck";
import { parseRequirement } from "./utils/parseRequirement";

/**
 * Check if application is running in development mode
 */
const isDev = process.env.NODE_ENV === "development";

ipcMain.handle('check-python-version', async () => {
    try {
        const response = await checkPythonVersion();
        return response;
    } catch (error: any) {
        return error;
    }
});

ipcMain.handle('check-python-library-requirements', async (event) => {
    try {
        const requirements = parseRequirement();
        const response = await checkPythonLibraryRequirements(requirements);
        return response;
    } catch (error: any) {
        return { message: error };
    }
});


ipcMain.handle('ocr-image-python', async (event, base64Data: string, lang: string = "en") => {
    return new Promise((resolve) => {
        const pythonProcess = getOrCreatePythonProcess(lang);

        /**
         * Push resolve function to queue for this language
         */
        ocrRequests[lang].push(resolve);

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
ipcMain.handle('capture-screen', async () => {
    try {
        const base64 = await captureRegionInteractive();
        return { base64 };
    } catch (error: any) {
        return { error: error.message };
    }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, "../assets/logo.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    /**
     * Register shortcut to trigger screenshot translate
     */
    const shortcut = 'Ctrl+Shift+Space';
    globalShortcut.register(shortcut, () => {
        win.webContents.send('trigger-translate');
    });

    win.once('ready-to-show', () => {
        /**
         * Show window and maximize it but keep title bar
         */
        win.maximize()
        win.show()
    })

    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }
}

app.whenReady().then(async () => {
    if (isDev) {
        await installExtension(REACT_DEVELOPER_TOOLS)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
    }
    createWindow()
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

/**
 * Register Kill all python processes when app quits
 */
app.on('will-quit', () => {
    for (const lang in pythonProcesses) {
        if (pythonProcesses[lang]) {
            pythonProcesses[lang].kill();
        }
    }
});
