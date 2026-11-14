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
import { ensureDependencies, dependenciesStatus, startBackend, cleanupBackend, stopBackend } from "./module/checking/serviceStartup";
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
        overlayWindow.loadURL('http://localhost:5173/#/overlay');
        // overlayWindow.webContents.openDevTools()
    } else {
        overlayWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: '/overlay' });
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
 * Get Python dependencies status
 */
ipcMain.handle('python-status', () => dependenciesStatus)
ipcMain.handle('retry-install', () => {
    ensureDependencies().then(startBackend).catch(() => {});
    return true;
})

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
    cleanupBackend();

    ensureDependencies().then(startBackend).catch((e) => { 
        console.error('[Dependencies]', e.message); 
    });
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
    stopBackend();
});