import { BrowserWindow, screen, desktopCapturer, ipcMain, app } from 'electron';
import { Canvas, Image } from 'canvas';
import { promisify } from 'util';
import { pathToFileURL } from 'url';

import { getResourceElectronPath } from '../../utils/getResourcePath';

/**
 * Disable hardware acceleration (Fix black screen issue when capturing video or other apps due to GPU conflict.)
 */
app.disableHardwareAcceleration();

/**
 * Compose all screen captures and crop to the selected region.
 */
const composeScreens = async (x: number, y: number, width: number, height: number): Promise<string> => {
    const displays = screen.getAllDisplays();

    // Calculate bounding box of ALL displays
    const minX = Math.min(...displays.map((d) => d.bounds.x));
    const minY = Math.min(...displays.map((d) => d.bounds.y));
    const maxX = Math.max(...displays.map((d) => d.bounds.x + d.bounds.width));
    const maxY = Math.max(...displays.map((d) => d.bounds.y + d.bounds.height));

    const totalWidth = maxX - minX;
    const totalHeight = maxY - minY;

    const sources = await desktopCapturer.getSources({ 
        types: ['screen'],
        thumbnailSize: {
            width: maxX - minX,
            height: maxY - minY,
        },
    });

    const canvas = new Canvas(totalWidth, totalHeight);
    const ctx = canvas.getContext('2d');

    const loadImage = promisify((buf: Buffer, cb: (err: Error | null, img?: Image) => void) => {
        const img = new Image();
        img.onload = () => cb(null, img);
        img.onerror = (err) => cb(err instanceof Error ? err : new Error('Image load failed'));
        img.src = buf;
    }) as (buf: Buffer) => Promise<Image>;

    for (const source of sources) {
        const imgBuffer = source.thumbnail.toPNG();
        const img = await loadImage(imgBuffer);

        // Match source to display
        const displayIndex = displays.findIndex((d) => String(d.id) === source.display_id);
        if (displayIndex === -1) continue;

        const display = displays[displayIndex];
        const drawX = display.bounds.x - minX;
        const drawY = display.bounds.y - minY;

        ctx.drawImage(img, drawX, drawY);
    }

    // Validate crop region is within canvas bounds
    const clampedX = Math.max(0, Math.min(x, totalWidth - 1));
    const clampedY = Math.max(0, Math.min(y, totalHeight - 1));
    const clampedW = Math.min(width, totalWidth - clampedX);
    const clampedH = Math.min(height, totalHeight - clampedY);

    if (clampedW < 1 || clampedH < 1) {
        throw new Error(`Crop region is invalid: ${clampedW}x${clampedH} on canvas ${totalWidth}x${totalHeight}`);
    }

    // Crop to selection region
    const result = new Canvas(clampedW, clampedH);
    result.getContext('2d').drawImage(canvas, clampedX, clampedY, clampedW, clampedH, 0, 0, clampedW, clampedH);
    return result.toDataURL();
};

/**
 * Show overlay selection on all monitors and capture the selected region.
 */
export const captureRegionInteractive = async (): Promise<string> => {
    // Create one overlay window per monitor
    return new Promise((resolve, reject) => {
        const overlayWindows = new Map<number, BrowserWindow>();
        let isSettled = false;

        const displays = screen.getAllDisplays();
        const minX = Math.min(...displays.map((d) => d.bounds.x));
        const minY = Math.min(...displays.map((d) => d.bounds.y));

        // Store original positions (relative to top-left of all displays)
        const originalPositions = new Map<number, { x: number; y: number }>();
        displays.forEach((d) => {
            originalPositions.set(d.id, {
                x: d.bounds.x - minX,
                y: d.bounds.y - minY,
            });
        });

        const handleCancel = () => {
            if (isSettled) return;
            isSettled = true;
            cleanup();
            reject(new Error('User canceled selection'));
        };

        const handleCapture = async (_event: Electron.IpcMainEvent, payload: {
            selectionScreenId: string;
            localX: number;
            localY: number;
            localWidth: number;
            localHeight: number;
        }) => {
            if (isSettled) return;
            isSettled = true;
            cleanup();

            // Convert local coords (relative to this display within composed canvas) to absolute coords
            const origPos = originalPositions.get(Number(payload.selectionScreenId));
            if (!origPos) {
                reject(new Error(`Unknown selection screen: ${payload.selectionScreenId}`));
                return;
            }

            const absX = origPos.x + payload.localX;
            const absY = origPos.y + payload.localY;

            try {
                const imageBase64 = await composeScreens(absX, absY, payload.localWidth, payload.localHeight);
                resolve(imageBase64);
            } catch (err) {
                reject(err as Error);
            }
        };

        const cleanup = () => {
            ipcMain.off('capture-selection', handleCapture);
            ipcMain.off('cancel-selection', handleCancel);
            for (const [, win] of overlayWindows) {
                if (!win.isDestroyed()) win.close();
            }
            overlayWindows.clear();
        };

        // Create one overlay window per monitor
        for (const display of displays) {
            const { id, bounds } = display;
            const origPos = originalPositions.get(id)!;

            const overlayWin = new BrowserWindow({
                x: origPos.x,
                y: origPos.y,
                width: bounds.width,
                height: bounds.height,
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

            const overlayPath = getResourceElectronPath('screenshot', '/selectionOverlay.html');
            const screenUrl = new URL(`?screenId=${id}`, pathToFileURL(overlayPath));

            overlayWin.loadURL(screenUrl.toString());

            overlayWin.once('ready-to-show', () => {
                overlayWin?.show();
                overlayWin?.focus();
            });

            overlayWin?.once('closed', () => {
                if (!isSettled) {
                    isSettled = true;
                    cleanup();
                    reject(new Error('Selection window closed unexpectedly'));
                }
            });

            overlayWindows.set(id, overlayWin);
        }

        ipcMain.on('capture-selection', handleCapture);
        ipcMain.on('cancel-selection', handleCancel);
    });
};

