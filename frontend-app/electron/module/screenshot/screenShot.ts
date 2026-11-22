import { BrowserWindow, screen, desktopCapturer, ipcMain } from 'electron';
import { Canvas, Image } from 'canvas';
import { promisify } from 'util';
import { pathToFileURL } from 'url';

/**
 * Utils
 */
import { getResourceElectronPath } from '../../utils/getResourcePath';

/**
 * Type
 */
import type { pickDesktopSourceParam, captureDisplayParam } from '../../type/screenShot.type';


const decodeToImage = promisify((buffer: Buffer, cb: (err: Error | null, img?: Image) => void) => {
    const img = new Image();
    img.onload = () => cb(null, img);
    img.onerror = (err) => cb(err instanceof Error ? err : new Error('Image load failed'));
    img.src = buffer;
}) as (buffer: Buffer) => Promise<Image>;


/**
 * Pick desktop source by display_id or label DISPLAY<n>, or marker from sources
 * @param param - Pick desktop source parameter
 * @returns - Pick desktop source result
 */
export const pickDesktopSource = async (param: pickDesktopSourceParam): Promise<{ source: Electron.DesktopCapturerSource; trace: string[] }> => {
    /**
     * Trace log - get error message for each Attempt
     */
    const trace: string[] = [];

    /**
     * Attempt 1: pick source by display_id
     * @description Pick source by display_id from sources: Electron.DesktopCapturerSource[] if it exists
     */
    const byID = param.sources.find((src) => src.display_id === String(param.display.id));
    if (byID) {
        trace.push(`Attempt 1 hit: display_id`);
        return { source: byID, trace }
    }
    trace.push(`Attempt 1 miss: display ids = [${param.sources.map((src) => JSON.stringify(src.display_id))}] vs display_id = "${param.display.id}"`);

    /**
     * Attempt 2: pick source by label DISPLAY<n>
     * @description Pick source by label DISPLAY<n> from sources: Electron.DesktopCapturerSource[] if it exists
     */
    const labelNums = [...String(param.display.label ?? '').matchAll(/DISPLAY\s*(\d+)/gi)].map((m) => Number(m[1]));
    if (labelNums.length === 1) {
        const byNameNum = param.sources.find((src) => {
            const nameNums = [...String(src.name ?? '').matchAll(/(?:SCREEN|DISPLAY)\s*(\d+)/gi)].map((m) => Number(m[1]));
            return nameNums.length === 1 && nameNums[0] === labelNums[0];
        });
        if (byNameNum) {
            trace.push(`Attempt 2 hit: label DISPLAY ${labelNums[0]} <-> ${byNameNum.name}`);
            return { source: byNameNum, trace }
        }
        trace.push(`Attempt 2 miss: no unique "DISPLAY ${labelNums[0]}" among names=[${param.sources.map((src) => src.name)}]`);
    } else {
        trace.push(`Attempt 2 skip: label="${param.display.label}" contains ${labelNums.length} DISPLAY<n> numbers`);
    }

    /**
     * Attempt 3: pick source by marker
     * @description We will add marker with random rgb color to pick source.
     */
    const markerRgb = [30, 30, 30].map(() => 30 + Math.floor(Math.random() * 196));
    const markerHex = markerRgb.map((color) => color.toString(16).padStart(2, '0')).join('');
    const markerWindow = new BrowserWindow({
        x: param.display.bounds.x + 4,
        y: param.display.bounds.y + 4,
        width: 40,
        height: 40,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focusable: false,
        movable: false,
        show: false,
        backgroundColor: `#${markerHex}`,
    });
    markerWindow.setAlwaysOnTop(true, 'screen-saver');
    markerWindow.showInactive();

    /**
     * Wait for marker to show up.
     */
    await new Promise((r) => setTimeout(r, 400));

    /**
     * Check list of display sources to find the one with marker color -> return it
     * TempSource is a frame with marker on it.
     * CleanSource is a frame without marker on it.
     * MatchedSource is the one that has the marker color. 
     * So we will return CleanSource.
     */
    try {
        const tempSources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: param.thumbnailSize });
        let matchedWithoutClean = 0;
        for (const tempSource of tempSources) {
            const thumb = await decodeToImage(tempSource.thumbnail.toPNG());
            const canvas = new Canvas(1, 1);
            const cx = canvas.getContext('2d');
            cx.drawImage(thumb, Math.round(24 * thumb.width / param.display.bounds.width), Math.round(24 * thumb.height / param.display.bounds.height), 1, 1, 0, 0, 1, 1);
            const markerPixel = cx.getImageData(0, 0, 1, 1).data;
            if (!markerRgb.every((expected, channel) => Math.abs(markerPixel[channel] - expected) < 12)) continue;
            const cleanSource = param.sources.find((src) => src.id === tempSource.id);
            if (cleanSource) {
                trace.push(`Attempt 3 hit: marker #${markerHex} readback rgb=${markerPixel[0]},${markerPixel[1]},${markerPixel[2]}`);
                return { source: cleanSource, trace, }
            }
            matchedWithoutClean++;
        }

        const failReason = matchedWithoutClean ?
            `Attempt 3: ${matchedWithoutClean} source(s) showed the marker but were missing from the pre-marker list => display list changed mid-probe.` :
            `Attempt 3: none of ${tempSources.length} source(s) showed marker #${markerHex} (rgb=${markerRgb}) => marker not painted (up to 400ms wait), bi che, or thumbnail compression shifted the color past the 12 tolerance.`;
        throw new Error(failReason);
    } catch (probeError) {
        throw new Error(`No capture source for display ${param.display.id} (label="${param.display.label}"):\n  ` + trace.join('\n  ') + '\n  ' + (probeError as Error).message + '\n  sources=' + JSON.stringify(param.sources.map((src) => ({ display_id: String(src.display_id), name: src.name }))), { cause: probeError });
    } finally {
        markerWindow.destroy();
    }
};

/**
 * Capture the selected region of one display (selection always lives within a single display).
 */
const captureDisplay = async (param: captureDisplayParam): Promise<string> => {
    const { bounds, scaleFactor } = param.display;
    const thumbnailSize: { width: number; height: number } = {
        width: Math.round(bounds.width * scaleFactor),
        height: Math.round(bounds.height * scaleFactor),
    };
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: thumbnailSize });

    const { source } = await pickDesktopSource({ display: param.display, sources, thumbnailSize: thumbnailSize });
    const displayThumb = await decodeToImage(source.thumbnail.toPNG());

    const scaleX = displayThumb.width / bounds.width;
    const scaleY = displayThumb.height / bounds.height;
    const cropX = Math.max(0, Math.min(Math.round(param.x * scaleX), displayThumb.width - 1));
    const cropY = Math.max(0, Math.min(Math.round(param.y * scaleY), displayThumb.height - 1));
    const cropW = Math.min(Math.round(param.width * scaleX), displayThumb.width - cropX);
    const cropH = Math.min(Math.round(param.height * scaleY), displayThumb.height - cropY);

    if (cropW < 1 || cropH < 1) {
        throw new Error(`Crop region is invalid: ${cropW}x${cropH} on image ${displayThumb.width}x${displayThumb.height}`);
    }

    const cropCanvas = new Canvas(cropW, cropH);
    cropCanvas.getContext('2d')?.drawImage(displayThumb, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    return cropCanvas.toDataURL();

}

/**
 * Show overlay selection on all monitors and capture the selected region.
 */
export const captureRegionInteractive = async (): Promise<string> => {
    // Create one overlay window per monitor
    return new Promise((resolve, reject) => {
        const overlayWindows = new Map<number, BrowserWindow>();
        let isSettled = false;

        /**
         * Get all display information
         */
        const displays = screen.getAllDisplays();

        /**
         * Handle user cancel selection
         */
        const handleCancel = () => {
            if (isSettled) return;
            isSettled = true;
            cleanup();
            reject(new Error('User canceled selection'));
        };

        /**
         * Handle user capture selection
         * Each overlay covers exactly one display, so the selection is fully inside
         * it -- capture/crop that single display only (no multi-monitor compose).
         * @param _event event object
         * @param payload selection payload
         * @returns captured image as a data URL (has the data:image/png;base64, prefix)
         */
        const handleCapture = async (_event: Electron.IpcMainEvent, payload: { selectionScreenId: string; localX: number; localY: number; localWidth: number; localHeight: number; }) => {
            if (isSettled) return;
            isSettled = true;
            cleanup();

            // Convert local coords (relative to this display within composed canvas) to absolute coords
            const display = displays.find((d) => String(d.id) === payload.selectionScreenId);
            if (!display) {
                reject(new Error(`Unknown selection screen: ${payload.selectionScreenId}`));
                return;
            }

            try {
                const imageDataUrl = await captureDisplay({ display, x: payload.localX, y: payload.localY, width: payload.localWidth, height: payload.localHeight });
                resolve(imageDataUrl);
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

        // One full-screen transparent overlay per monitor. x/y are ABSOLUTE virtual
        // desktop coords and may be negative: normalizing them to positive
        // (bounds.x - minX) shifts overlays off their monitors whenever a display is
        // placed left/above the primary in Windows display settings.
        for (const display of displays) {
            const { id, bounds } = display;

            const overlayWin = new BrowserWindow({
                x: bounds.x,
                y: bounds.y,
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

