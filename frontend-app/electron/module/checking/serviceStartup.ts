/* eslint-disable */
import { app } from 'electron';
import { spawn, ChildProcess, exec, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { homedir } from 'os';
import { createHash } from 'crypto';

/**
 * Config
 */
import { API_HOST, API_PORT } from '../../config';

export let backendProcess: ChildProcess | null = null;
export let dependenciesStatus: { phase: 'idle' | 'installing' | 'ready' | 'error'; message?: string } = { phase: 'idle' };

const RUNTIME_URL = 'https://github.com/khangnguyen412/ElecTranslator-Project/releases/download/runtime-win-v3/runtime-win-v3.zip';
const RUNTIME_SHA256 = '6E53491A88EA69938203DC4DFB0D8239E86C85B3FEE28C620410AC23FB8326B8';

const envRoot = () => path.join(app.getPath('userData'), 'python-env');
const sources = () => app.isPackaged ? {
    python: path.join(process.resourcesPath, 'python'),
    wheels: path.join(process.resourcesPath, 'wheels'),
    scripts: path.join(process.resourcesPath, 'scripts'),
    backend: path.join(process.resourcesPath, 'backend')
} : {
    python: path.join(app.getAppPath(), 'resources', 'python'),
    wheels: path.join(app.getAppPath(), 'resources', 'wheels'),
    scripts: path.join(app.getAppPath(), 'resources', 'scripts'),
    backend: path.join(app.getAppPath(), '..', 'backend')
};

/**
 * Ensure runtime is available
 * @param env 
 * @param src 
 * @returns 
 */
const ensureRuntime = async (env: string, src: ReturnType<typeof sources>): Promise<void> => {
    if (fs.existsSync(path.join(env, 'python', 'python.exe')) || fs.existsSync(path.join(src.python, 'python.exe'))) return;
    const zip = path.join(app.getPath('userData'), 'runtime-win.zip');

    if (!fs.existsSync(zip)) {
        dependenciesStatus.message = 'Downloading runtime...';
        const res = await fetch(RUNTIME_URL, { signal: AbortSignal.timeout(20 * 60_000) });
        if (!res.ok) throw new Error('Runtime URL response status ' + res.status);
        const out = fs.createWriteStream(zip + '.part');
        const total = Number(res.headers.get('content-length') ?? 0);
        let got = 0;
        for await (const chunk of res.body ?? []) {
            const buf = Buffer.from(chunk as ArrayBuffer);
            out.write(buf); got += buf.length;
            if (total) dependenciesStatus.message = `Downloading runtime... ${Math.round(got / total * 100)}%`;
        }
        await new Promise<void>((r, j) => { out.on('close', r); out.on('error', j); out.close(); });
        const h = createHash('sha256').update(fs.readFileSync(zip + '.part')).digest('hex');
        if (h !== RUNTIME_SHA256.toLowerCase()) { fs.rmSync(zip + '.part'); throw new Error('SHA256 runtime not match'); }
        fs.renameSync(zip + '.part', zip);
    }

    dependenciesStatus.message = 'Unpacking runtime...';
    fs.mkdirSync(env, { recursive: true });
    execSync(`tar -xf "${zip}" -C "${env}"`);
};

/**
 * Ensure dependencies are available
 * @returns 
 */
export const ensureDependencies = async (): Promise<void> => {
    if (dependenciesStatus.phase === 'installing') {
        return;
    }

    dependenciesStatus.phase = 'installing';
    try {
        const src = sources();
        const env = envRoot();
        const python = path.join(env, 'python', 'python.exe'); // windows only
        const requirementDeps = path.join(src.backend, 'requirements.txt');
        const marker = path.join(env, '.deps_installed');
        const hash = createHash('md5').update(fs.readFileSync(requirementDeps)).digest('hex');

        /**
         * Check if dependencies are already installed -> match -> skip installation
         */
        if (fs.existsSync(marker) && fs.readFileSync(marker, 'utf-8') === hash) {
            dependenciesStatus.phase = 'ready';
            return;
        }

        /**
         * Kill backend process if running
         * Remove existing environment if it exists
         */
        await killBackend();
        fs.rmSync(env, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
        await ensureRuntime(env, src);
        for (const item of ['python', 'wheels', 'scripts'] as const) {
            if (fs.existsSync(src[item])) fs.cpSync(src[item], path.join(env, item), { recursive: true });
        }

        /**
         * Create python-env/backend/ in userData and copy requirements.txt from backend
         */
        fs.mkdirSync(path.join(env, 'backend'), { recursive: true });
        fs.copyFileSync(requirementDeps, path.join(env, 'backend', 'requirements.txt'));

        /**
         * Run script to install dependencies
         */
        const log = fs.createWriteStream(path.join(env, 'install.log'), { flags: 'a' });
        const child = spawn(python, ['-s', path.join(env, 'scripts', 'install_deps.py')]);
        child.stdout!.pipe(log); child.stderr!.pipe(log);

        await new Promise<void>((resolve, reject) => {
            const t = setTimeout(() => { child.kill(); reject(new Error('Install timeout 5 minutes')); }, 5 * 60_000);
            child.on('close', (c) => { clearTimeout(t); c === 0 ? resolve() : reject(new Error(`Install exit ${c} — please check ${path.join(env, 'install.log')}`)); });
            child.on('error', reject);
        });

        /**
         * Install dependencies successfully
         * Write marker file to indicate installation is done for skip reinstall in next time
         */
        fs.writeFileSync(marker, hash);
        fs.rmSync(path.join(homedir(), '.paddlex'), { recursive: true, force: true });
        dependenciesStatus = { phase: 'ready' };
    } catch (error: any) {
        dependenciesStatus.phase = 'error';
        dependenciesStatus.message = error.message;
        throw error;
    }
};

const killBackend = (): Promise<void> => {
    return new Promise((resolve) => {
        if (process.platform === 'win32') {
            /**
             * On Windows
             * Find PID and kill process on port PORT
             */
            const command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr ":${API_PORT}" ^| findstr "LISTENING"') do taskkill /F /PID %a`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    /**
                     * If no process found, ignore the error
                     */
                    if (!stderr.includes("Could not find any process")) {
                        console.log(`[Cleanup] No process found on port ${API_PORT} or already cleared.`);
                    }
                } else {
                    console.log(`[Cleanup] Successfully killed process on port ${API_PORT}.`);
                }
                resolve();
            });
        } else {
            /**
             * On Unix
             * Find PID and kill process on port PORT
             */
            const command = `lsof -ti :${API_PORT} | xargs kill -9`;

            exec(command, (error) => {
                if (error) {
                    console.log(`[Cleanup] No process found on port ${API_PORT} (Unix).`);
                } else {
                    console.log(`[Cleanup] Successfully killed process on port ${API_PORT}.`);
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
                /**
                 * Stop old backend instance if running
                 */
                if (backendProcess) {
                    console.log('[Backend] Already running.');
                    resolve();
                    return;
                }
                console.log(`[Backend] Ensuring port ${API_PORT} is free...`);
                await killBackend();

                if (backendProcess) {
                    console.log('[Backend] Already running (won after kill).');
                    resolve();
                    return;
                }

                const backendPath = path.join(__dirname, '../../../../backend');
                console.log(`[Backend] Starting backend at: ${backendPath}`);

                /**
                 * Spawn new backend process instance if not running
                 */
                backendProcess = spawn(path.join(envRoot(), 'python', 'python.exe'), ['-s', '-m', 'uvicorn', 'main:app', '--host', API_HOST, '--port', API_PORT], {
                    cwd: backendPath,
                    env: { ...process.env },
                    stdio: ['ignore', 'pipe', 'pipe']
                });
                console.log(`[Backend] Spawned pid ${backendProcess.pid}`);

                let isResolved = false;
                let startupTimeout: NodeJS.Timeout | undefined = undefined;

                backendProcess.stderr?.on('data', (data: Buffer) => {
                    const log = data.toString().trim();
                    if (log.includes("error while attempting to bind on address")) {
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout) clearTimeout(startupTimeout);
                            console.warn(`[Backend Warning] Port ${API_PORT} is busy. Assuming it is our old instance or another service.`);
                            /**
                             * Kill the process if it's our old instance or another service
                             */
                            backendProcess?.kill();
                            backendProcess = null;
                            reject(new Error(`[Backend Error] Port ${API_PORT} is already in use. Please close other instances.`));
                        }
                    } else if (log.includes("Uvicorn running on") || log.includes("Application startup complete")) {
                        console.log(`[Backend Info] ${log}`);
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout) clearTimeout(startupTimeout);
                            resolve();
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
                }, 60_000);

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
export const cleanupBackend = () => {
    /**
     * Handle cleanup when app closes
     */
    app.once('before-quit', () => {
        console.log('App is closing, stopping backend...');
        try { backendProcess?.kill('SIGINT'); } catch (e) {
            console.error('Error sending SIGINT:', e);
        }
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

    /**
     * Force-cleanup port PORT when app closes or process exits
     */
    process.on('exit', async () => {
        console.log(`[Cleanup] Force-cleaning port ${API_PORT}...`);
        try {
            if (process.platform === 'win32') {
                execSync(`for /f "tokens=5" %a in (\'netstat -ano ^| findstr ":${API_PORT}" ^| findstr "LISTENING"\') do taskkill /F /PID %a`, { stdio: 'ignore' });
            } else {
                execSync(`lsof -ti :${API_PORT} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
            }
        } catch {
            console.log('[Cleanup] No process found — fine');
        }
    });
};