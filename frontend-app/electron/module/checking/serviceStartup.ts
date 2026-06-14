import { app } from 'electron';
import { spawn, ChildProcess, exec } from 'child_process';
import path from 'path';


export let backendProcess: ChildProcess | null = null;

const killBackend = (): Promise<void> => {
    return new Promise((resolve) => {
        if (process.platform === 'win32') {
            /**
             * On Windows
             * Find PID and kill process on port 8000
             */
            const command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr :8000') do taskkill /F /PID %a`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    /**
                     * If no process found, ignore the error
                     */
                    if (!stderr.includes("Could not find any process")) {
                        console.log('[Cleanup] No process found on port 8000 or already cleared.');
                    }
                } else {
                    console.log('[Cleanup] Successfully killed process on port 8000.');
                }
                resolve();
            });
        } else {
            /**
             * On Unix
             * Find PID and kill process on port 8000
             */
            const command = 'lsof -ti :8000 | xargs kill -9';

            exec(command, (error) => {
                if (error) {
                    console.log('[Cleanup] No process found on port 8000 (Unix).');
                } else {
                    console.log('[Cleanup] Successfully killed process on port 8000 (Unix).');
                }
                resolve();
            });
        }
    });
};


export const startBackend = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const initBackend = async () => {
            try {
                console.log('[Backend] Ensuring port 8000 is free...');
                await killBackend();

                /**
                 * Stop old backend instance if running
                 */
                if (backendProcess) {
                    console.log('[Backend] Backend is already running. Stopping old instance...');
                    resolve();
                    return;
                }

                const backendPath = path.join(__dirname, '../../../../backend');
                console.log(`[Backend] Starting backend at: ${backendPath}`);

                /**
                 * Spawn new backend process instance if not running
                 */
                backendProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--port', '8000'], {
                    cwd: backendPath,
                    shell: true,
                    env: { ...process.env },
                    stdio: ['ignore', 'pipe', 'pipe']
                });

                let isResolved = false;
                let startupTimeout: NodeJS.Timeout | undefined = undefined;

                backendProcess.stderr?.on('data', (data: Buffer) => {
                    const log = data.toString().trim();
                    if (log.includes("error while attempting to bind on address")) {
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout) clearTimeout(startupTimeout);
                            console.warn('[Backend Warning] Port 8000 is busy. Assuming it is our old instance or another service.');
                            /**
                             * Kill the process if it's our old instance or another service
                             */
                            backendProcess?.kill();
                            backendProcess = null;
                            reject(new Error('[Backend Error] Port 8000 is already in use. Please close other instances.'));
                        }
                    } else if (log.includes("ERROR") || log.includes("Traceback")) {
                        console.error(`[Backend Critical] ${log}`);
                    } else {
                        console.log(`[Backend Info] ${log}`);
                    }
                });

                backendProcess.stdout?.on('data', (data: Buffer) => {
                    const log = data.toString().trim();
                    console.log(`[Backend Out] ${log}`);

                    /**
                     * Check if backend started successfully
                     */
                    if (log.includes("Uvicorn running on") || log.includes("Application startup complete")) {
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout) clearTimeout(startupTimeout);
                            resolve();
                        }
                    }
                });

                backendProcess.on('error', (err) => {
                    console.error('[Backend Error] Failed to start backend:', err);
                    if (!isResolved) {
                        isResolved = true;
                        if (startupTimeout) clearTimeout(startupTimeout);
                        backendProcess = null;
                        reject(err);
                    }
                });

                backendProcess.on('close', (code) => {
                    console.log(`[Backend] Backend process exited with code ${code}`);
                    backendProcess = null;
                });

                /**
                 * Wait for backend to start within timeout period
                 */
                startupTimeout = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        if (backendProcess) {
                            backendProcess.kill();
                            backendProcess = null;
                        }
                        reject(new Error('[Backend Error] Backend failed to start within timeout'));
                    }
                }, 5000);

            } catch (error) {
                reject(error);
            }
        };

        initBackend();
    });
};

export const stopBackend = async (): Promise<void> => {
    return new Promise((resolve) => {
        if (!backendProcess) {
            resolve();
            return;
        }

        console.log('[Backend] Stopping backend process...');

        let isKilled = false;

        backendProcess.once('close', () => {
            if (!isKilled) {
                isKilled = true
                backendProcess = null
                console.log('[Backend] Backend process stopped successfully.');
                resolve()
            }
        })

        /**
         * Send SIGINT to backend process to stop gracefully
         */
        try {
            backendProcess.kill('SIGINT');
        } catch (e) {
            console.error('Error sending SIGINT:', e);
        }

        /**
         * Force kill backend process if it's not stopped within 3 seconds
         * Wait for backend process to stop gracefully
         */
        setTimeout(() => {
            if (backendProcess && !isKilled) {
                console.log('Force killing backend...');
                try {
                    backendProcess.kill('SIGKILL');
                } catch (e) {
                    console.error('Error force killing:', e);
                }
                isKilled = true;
                backendProcess = null;
                resolve();
            }
        }, 3000);
    })
};

/**
 * Setup Cleanup backend process when app closes
 */
export const setupBackendCleanup = () => {
    /**
     * Handle cleanup when app closes
     */
    app.on('before-quit', async () => {
        console.log('App is closing, stopping backend...');
        await stopBackend();
    });

    /**
     * Handle terminate signals
     */
    process.on('SIGINT', async () => {
        console.log('Received SIGINT, stopping backend...');
        await stopBackend();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM, stopping backend...');
        await stopBackend();
        process.exit(0);
    });
};