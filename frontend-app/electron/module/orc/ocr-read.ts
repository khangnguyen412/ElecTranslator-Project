/* eslint-disable */
import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";

/**
 * Manage Python processes by language, avoid creating multiple processes for the same language
 */
export const pythonProcesses: { [lang: string]: ChildProcessWithoutNullStreams } = {};

/**
 * Store resolve functions for each language, to handle results from Python process
 */
export const ocrRequests: { [lang: string]: ((value: any) => void)[] } = {};

export const getOrCreatePythonProcess = (lang: string): ChildProcessWithoutNullStreams => {
    if (pythonProcesses[lang]) {
        return pythonProcesses[lang];
    }

    const scriptPath = app.isPackaged ? path.join(process.resourcesPath, 'resources', 'paddleORC.py') : path.join(app.getAppPath(), 'python/module/paddleORC.py');

    /**
     * Start Python process and keep it running continuously throughout the application lifecycle
     */
    console.log(`Start Python process for ${lang}`);
    const pythonProcess = spawn('python', ['-u', scriptPath, lang]);
    pythonProcesses[lang] = pythonProcess;
    ocrRequests[lang] = [];

    let stdoutBuffer = '';

    /**
     * Listen for data from Python when stdout emits data
     */
    pythonProcess.stdout.on('data', (data) => {
        stdoutBuffer += data.toString();

        /**
         * Parse JSON results from Python process stdout
         */
        let lineIndex: number;
        while ((lineIndex = stdoutBuffer.indexOf('\n')) !== -1) {
            const line = stdoutBuffer.substring(0, lineIndex).trim();
            stdoutBuffer = stdoutBuffer.substring(lineIndex + 1);

            if (line.startsWith('{') && line.endsWith('}')) {
                try {
                    const result = JSON.parse(line);
                    /**
                     * Resolve next request in queue for this language with result
                     */
                    const resolveNext = ocrRequests[lang].shift();
                    if (resolveNext) resolveNext(result);
                } catch (e: any) {
                    console.error("Python process error parsing JSON:", e);
                }
            }
        }
    });

    /**
     * Listen for data from Python when stderr emits data
     */
    pythonProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        const isHarmlessWarning = msg.includes("UserWarning") || msg.includes("pin_memory") || msg.includes('no accelerator is found');
        if (!isHarmlessWarning && msg) {
            console.error(`Log:`, msg);
        }
    });

    /**
     * If Python process crashes unexpectedly, clear cache and restart it next time
     */
    pythonProcess.on('close', () => {
        delete pythonProcesses[lang];
        /**
         * Clear cache for this language if Python process crashes unexpectedly
         */
        while (ocrRequests[lang]?.length > 0) {
            const resolveNext = ocrRequests[lang].shift();
            if (resolveNext) resolveNext({ success: false, error: "Python process crashed unexpectedly." });
        }
    });

    return pythonProcess;
}
