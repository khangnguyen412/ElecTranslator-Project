"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreatePythonProcess = exports.ocrRequests = exports.pythonProcesses = void 0;
/* eslint-disable */
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
/**
 * Manage Python processes by language, avoid creating multiple processes for the same language
 */
exports.pythonProcesses = {};
/**
 * Store resolve functions for each language, to handle results from Python process
 */
exports.ocrRequests = {};
const getOrCreatePythonProcess = (lang) => {
    if (exports.pythonProcesses[lang]) {
        return exports.pythonProcesses[lang];
    }
    const scriptPath = electron_1.app.isPackaged ? path_1.default.join(process.resourcesPath, 'resources', 'paddleORC.py') : path_1.default.join(electron_1.app.getAppPath(), 'python/module/paddleORC.py');
    /**
     * Start Python process and keep it running continuously throughout the application lifecycle
     */
    console.log(`Start Python process for ${lang}`);
    const pythonProcess = (0, child_process_1.spawn)('python', ['-u', scriptPath, lang]);
    exports.pythonProcesses[lang] = pythonProcess;
    exports.ocrRequests[lang] = [];
    let stdoutBuffer = '';
    /**
     * Listen for data from Python when stdout emits data
     */
    pythonProcess.stdout.on('data', (data) => {
        stdoutBuffer += data.toString();
        /**
         * Parse JSON results from Python process stdout
         */
        let lineIndex;
        while ((lineIndex = stdoutBuffer.indexOf('\n')) !== -1) {
            const line = stdoutBuffer.substring(0, lineIndex).trim();
            stdoutBuffer = stdoutBuffer.substring(lineIndex + 1);
            if (line.startsWith('{') && line.endsWith('}')) {
                try {
                    const result = JSON.parse(line);
                    /**
                     * Resolve next request in queue for this language with result
                     */
                    const resolveNext = exports.ocrRequests[lang].shift();
                    if (resolveNext)
                        resolveNext(result);
                }
                catch (e) {
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
        delete exports.pythonProcesses[lang];
        /**
         * Clear cache for this language if Python process crashes unexpectedly
         */
        while (exports.ocrRequests[lang]?.length > 0) {
            const resolveNext = exports.ocrRequests[lang].shift();
            if (resolveNext)
                resolveNext({ success: false, error: "Python process crashed unexpectedly." });
        }
    });
    return pythonProcess;
};
exports.getOrCreatePythonProcess = getOrCreatePythonProcess;
