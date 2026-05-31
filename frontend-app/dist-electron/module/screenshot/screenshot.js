"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureRegionInteractive = void 0;
const electron_1 = require("electron");
const getResourcePath_1 = require("../../utils/getResourcePath");
/**
 * Disable hardware acceleration (Fix black screen issue when capturing video or other apps due to GPU conflict.)
 */
electron_1.app.disableHardwareAcceleration();
/**
 * Capture region by coordinate (using desktopCapturer + canvas crop)
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns
 */
const captureRegionByCoord = async (x, y, width, height) => {
    /**
     * Get scale factor (for Retina display, and Windows display)
     */
    const { scaleFactor } = electron_1.screen.getPrimaryDisplay();
    const physicalX = Math.round(x * scaleFactor);
    const physicalY = Math.round(y * scaleFactor);
    const physicalWidth = Math.round(width * scaleFactor);
    const physicalHeight = Math.round(height * scaleFactor);
    /**
     * Capture full screen with physical size
     */
    const sources = await electron_1.desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
            width: electron_1.screen.getPrimaryDisplay().size.width * scaleFactor,
            height: electron_1.screen.getPrimaryDisplay().size.height * scaleFactor,
        },
    });
    /**
     * Get original image as nativeImage
     */
    const fullImage = sources[0].thumbnail;
    /**
     * Crop physical coordinate
     */
    const cropped = fullImage.crop({
        x: physicalX,
        y: physicalY,
        width: physicalWidth,
        height: physicalHeight,
    });
    /**
     * Return dataURL standard (PNG)
     */
    return cropped.toDataURL();
};
const captureRegionInteractive = async () => {
    return new Promise((resolve, reject) => {
        let selectionWindow = null;
        let isSettled = false; // Prevent resolve/reject 2 times
        const { width, height } = electron_1.screen.getPrimaryDisplay().workAreaSize;
        /**
         * Create overlay for selection area
         */
        selectionWindow = new electron_1.BrowserWindow({
            width,
            height,
            transparent: true,
            frame: false,
            alwaysOnTop: true,
            skipTaskbar: true,
            resizable: false,
            show: false,
            focusable: true,
            acceptFirstMouse: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        /**
         * Handle cancel selection area
         */
        const onCancel = () => {
            if (isSettled)
                return;
            isSettled = true;
            onCleanup();
            reject(new Error('User canceled selection'));
        };
        /**
         * Handle capture selection area
         */
        const onCapture = async (_event, { x, y, width, height }) => {
            if (isSettled)
                return;
            isSettled = true;
            onCleanup();
            if (width < 5 || height < 5) {
                reject(new Error('Selection area is too small'));
                return;
            }
            try {
                const imageBase64 = await captureRegionByCoord(x, y, width, height);
                resolve(imageBase64);
            }
            catch (err) {
                reject(err);
            }
        };
        /**
         * Cleanup all resources: remove listeners + close window
         */
        const onCleanup = () => {
            electron_1.ipcMain.removeListener('cancel-selection', onCancel);
            electron_1.ipcMain.removeListener('capture-selection', onCapture);
            if (selectionWindow && !selectionWindow.isDestroyed()) {
                selectionWindow.close();
            }
        };
        /**
         * Load selection overlay HTML
         */
        const overlayPath = (0, getResourcePath_1.getResourceElectronPath)('screenshot', '/selectionOverlay.html');
        selectionWindow.loadFile(overlayPath);
        selectionWindow.once('ready-to-show', () => {
            selectionWindow?.show();
            selectionWindow?.focus();
        });
        selectionWindow?.once('closed', () => {
            if (!isSettled) {
                isSettled = true;
                onCleanup();
                reject(new Error('Selection window closed unexpectedly'));
            }
        });
        /**
         * Handle cancel selection area
         */
        electron_1.ipcMain.once('capture-selection', onCapture);
        /**
         * Handle selection area
         */
        electron_1.ipcMain.once('cancel-selection', onCancel);
    });
};
exports.captureRegionInteractive = captureRegionInteractive;
