/* eslint-disable */
import { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen, } from 'electron';
import path from "path";

/**
 * React Developer Tools
 */
import { installExtension, REACT_DEVELOPER_TOOLS } from '@tomjs/electron-devtools-installer'

/**
 * Module
 */
import { captureRegionInteractive } from './module/screenshot/screenshot'
import { pythonProcesses, ocrRequests, getOCRCreatePythonProcess } from "./module/ocr/ocrRead";
import { checkPythonVersion, checkPythonLibraryRequirements } from "./module/checking/serviceCheck";
import { startBackend, setupBackendCleanup, stopBackend, backendProcess } from "./module/checking/serviceStartup";
import store from "./module/store/store";

let overlayWindow: BrowserWindow | null = null;
let overlayLoading = false;
let overlayLoadResolve: (() => void) | null = null;
let overlayHideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Create overlay window
 */
function createOverlayWindow() {
    overlayLoading = false;

    overlayWindow = new BrowserWindow({
        width: 520,
        height: 420,
        frame: false,
        transparent: true,
        hasShadow: false,
        focusable: true,

        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    overlayWindow.setAlwaysOnTop(true, 'screen-saver');

    if (isDev) {
        overlayWindow.loadURL('http://localhost:5173/overlay');
        // overlayWindow.webContents.openDevTools()
    } else {
        overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    overlayWindow.webContents.once('did-finish-load', () => {
        overlayLoading = false;
        if (overlayLoadResolve) {
            overlayLoadResolve();
            overlayLoadResolve = null;
        }
    });
}

/**
 * Create main window
 */
function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: app.isPackaged ? path.join(process.resourcesPath, "assets", "logo.ico") : path.join(path.resolve(__dirname, ".."), "assets", "logo.png"),
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
    win.once('closed', () => {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.destroy();
        }
    });
}


/**
 * Check if application is running in development mode
 */
const isDev = process.env.NODE_ENV === "development";

/**
 * Get setting from store
 */
ipcMain.handle('store:get-setting', () => {
    return store.get('data')['setting']
})

/**
 * Set setting to store
 */
ipcMain.handle('store:save-setting', (event, setting) => {
    const currentSetting = store.get('data')['setting']
    store.set("data.setting", { ...currentSetting, ...setting, })
    return true
})

/**
 * Get history from store
 */
ipcMain.handle('store:get-history', () => {
    return store.get('data')['history'] || []
})

/**
 * Set history to store
 */
ipcMain.handle('store:add-history', (event, record) => {
    const history = store.get('data')['history'] || []

    /**
     * Push new record to the head of history array
     */
    history.unshift(record)

    /**
     * Keep only 50 records
     */
    if (history.length > 50) {
        history.pop()
    }

    store.set("data.history", history)
    return true
})

/**
 * Clear history from store
 */
ipcMain.handle('store:clear-history', () => {
    store.set("data.history", [])
    return true
})

/**
 * Check Python version
 */
ipcMain.handle('check-python-version', async () => {
    try {
        const response = await checkPythonVersion();
        return response;
    } catch (error: any) {
        return error;
    }
});

/**
 * Start backend service
 */
ipcMain.handle('start-backend', async () => {
    try {
        await startBackend();
        return { status: 'success' };
    } catch (error) {
        return { status: 'error', message: error };
    }
});

/**
 * Check Python library requirements
 */
ipcMain.handle('check-python-library-requirements', async (event) => {
    try {
        const response = await checkPythonLibraryRequirements();
        return response;
    } catch (error: any) {
        return { message: error };
    }
});

/**
 * OCR image using Python
 */
ipcMain.handle('ocr-image-python', async (event, base64Data: string, lang: string = "en") => {
    return new Promise((resolve) => {
        const pythonProcess = getOCRCreatePythonProcess(lang);

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

/**
 * Copy text in overlay
 * @param text Text to copy
 * @returns True if copy is successful
 */
ipcMain.handle('copy-text', (_event, text: string) => {
    clipboard.writeText(text || '');
    return true;
});

/**
 * Hide overlay
 */
ipcMain.handle('hide-overlay', () => {
    overlayWindow?.hide();
    return true;
});

/**
 * Show translated text in overlay window
 */
ipcMain.handle('show-translated-text', async (_event, title: string, body: Array<{ text: string; type?: 'source' | 'translated' | 'error' }>) => {
    // console.log('[Main] show-translated-text received:', title, body);
    if (!overlayWindow || overlayWindow.isDestroyed()) {
        createOverlayWindow();
    }

    const win = overlayWindow!;

    /**
     * Wait for overlay to be ready
     */
    if (overlayLoading) {
        await new Promise<void>((resolve) => {
            overlayLoadResolve = resolve;
            setTimeout(() => resolve, 3000);
        });
    }

    const display = screen.getPrimaryDisplay();
    const { workArea } = display;

    /**
     * Set overlay position
     */
    win.setPosition(workArea.x + workArea.width - 540, workArea.y + 80);

    /**
     * Send translated text to overlay
     */
    win.webContents.send('display-overlay-translation', { title, body });

    /**
     * Show overlay inactive avoid focus stealing
     */
    win.showInactive();

    if (overlayHideTimer) {
        clearTimeout(overlayHideTimer);
    }

    overlayHideTimer = setTimeout(() => {
        if (!win.isDestroyed()) { win.hide(); }
    }, 60000);

    return true;
});


/**
 * Set app user model ID
 */
app.setAppUserModelId('com.electranslator.app');


app.whenReady().then(async () => {
    if (isDev) {
        await installExtension(REACT_DEVELOPER_TOOLS)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
    }
    createWindow();
    createOverlayWindow();
    setupBackendCleanup();
})

app.on("window-all-closed", () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.destroy();
    }
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

    stopBackend();
});