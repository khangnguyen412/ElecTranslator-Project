"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBackendCleanup = exports.stopBackend = exports.startBackend = exports.backendProcess = void 0;
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
exports.backendProcess = null;
const killBackend = () => {
    return new Promise((resolve) => {
        if (process.platform === 'win32') {
            /**
             * On Windows
             * Find PID and kill process on port 8000
             */
            const command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %a`;
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    /**
                     * If no process found, ignore the error
                     */
                    if (!stderr.includes("Could not find any process")) {
                        console.log('[Cleanup] No process found on port 8000 or already cleared.');
                    }
                }
                else {
                    console.log('[Cleanup] Successfully killed process on port 8000.');
                }
                resolve();
            });
        }
        else {
            /**
             * On Unix
             * Find PID and kill process on port 8000
             */
            const command = 'lsof -ti :8000 | xargs kill -9';
            (0, child_process_1.exec)(command, (error) => {
                if (error) {
                    console.log('[Cleanup] No process found on port 8000 (Unix).');
                }
                else {
                    console.log('[Cleanup] Successfully killed process on port 8000 (Unix).');
                }
                resolve();
            });
        }
    });
};
const startBackend = () => {
    return new Promise((resolve, reject) => {
        const initBackend = async () => {
            try {
                console.log('[Backend] Ensuring port 8000 is free...');
                await killBackend();
                /**
                 * Stop old backend instance if running
                 */
                if (exports.backendProcess) {
                    console.log('[Backend] Backend is already running. Stopping old instance...');
                    resolve();
                    return;
                }
                const backendPath = path_1.default.join(__dirname, '../../../../backend');
                console.log(`[Backend] Starting backend at: ${backendPath}`);
                /**
                 * Spawn new backend process instance if not running
                 */
                exports.backendProcess = (0, child_process_1.spawn)('python', ['-m', 'uvicorn', 'main:app', '--port', '8000'], {
                    cwd: backendPath,
                    shell: true,
                    env: { ...process.env },
                    stdio: ['ignore', 'pipe', 'pipe']
                });
                let isResolved = false;
                let startupTimeout = undefined;
                exports.backendProcess.stderr?.on('data', (data) => {
                    const log = data.toString().trim();
                    if (log.includes("error while attempting to bind on address")) {
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout)
                                clearTimeout(startupTimeout);
                            console.warn('[Backend Warning] Port 8000 is busy. Assuming it is our old instance or another service.');
                            // Thay vì reject, ta có thể thử restart hoặc báo lỗi nhẹ
                            // Ở đây ta chọn cách kill chính process vừa spawn và báo lỗi để người dùng biết
                            exports.backendProcess?.kill();
                            exports.backendProcess = null;
                            reject(new Error('[Backend Error] Port 8000 is already in use. Please close other instances.'));
                        }
                    }
                    else if (log.includes("ERROR") || log.includes("Traceback")) {
                        console.error(`[Backend Critical] ${log}`);
                    }
                    else {
                        console.log(`[Backend Info] ${log}`);
                    }
                });
                exports.backendProcess.stdout?.on('data', (data) => {
                    const log = data.toString().trim();
                    console.log(`[Backend Out] ${log}`);
                    // Kiểm tra xem server đã start thành công chưa
                    if (log.includes("Uvicorn running on") || log.includes("Application startup complete")) {
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout)
                                clearTimeout(startupTimeout);
                            resolve();
                        }
                    }
                });
                exports.backendProcess.on('error', (err) => {
                    console.error('[Backend Error] Failed to start backend:', err);
                    if (!isResolved) {
                        isResolved = true;
                        if (startupTimeout)
                            clearTimeout(startupTimeout);
                        exports.backendProcess = null;
                        reject(err);
                    }
                });
                exports.backendProcess.on('close', (code) => {
                    console.log(`[Backend] Backend process exited with code ${code}`);
                    exports.backendProcess = null;
                });
                /**
                 * Wait for backend to start within timeout period
                 */
                startupTimeout = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        if (exports.backendProcess) {
                            exports.backendProcess.kill();
                            exports.backendProcess = null;
                        }
                        reject(new Error('[Backend Error] Backend failed to start within timeout'));
                    }
                }, 5000);
            }
            catch (error) {
                reject(error);
            }
        };
        initBackend();
    });
};
exports.startBackend = startBackend;
const stopBackend = async () => {
    return new Promise((resolve) => {
        if (!exports.backendProcess) {
            resolve();
            return;
        }
        console.log('[Backend] Stopping backend process...');
        let isKilled = false;
        exports.backendProcess.once('close', () => {
            if (!isKilled) {
                isKilled = true;
                exports.backendProcess = null;
                console.log('[Backend] Backend process stopped successfully.');
                resolve();
            }
        });
        // Gửi SIGINT để Uvicorn tắt gracefully
        try {
            exports.backendProcess.kill('SIGINT');
        }
        catch (e) {
            console.error('Error sending SIGINT:', e);
        }
        // Force kill sau 3 giây nếu chưa tắt
        setTimeout(() => {
            if (exports.backendProcess && !isKilled) {
                console.log('Force killing backend...');
                try {
                    exports.backendProcess.kill('SIGKILL');
                }
                catch (e) {
                    console.error('Error force killing:', e);
                }
                isKilled = true;
                exports.backendProcess = null;
                resolve();
            }
        }, 3000);
    });
};
exports.stopBackend = stopBackend;
// Cleanup khi app đóng
const setupBackendCleanup = () => {
    // Xử lý khi app đóng
    electron_1.app.on('before-quit', async () => {
        console.log('App is closing, stopping backend...');
        await (0, exports.stopBackend)();
    });
    // Xử lý các tín hiệu terminate
    process.on('SIGINT', async () => {
        console.log('Received SIGINT, stopping backend...');
        await (0, exports.stopBackend)();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM, stopping backend...');
        await (0, exports.stopBackend)();
        process.exit(0);
    });
};
exports.setupBackendCleanup = setupBackendCleanup;
