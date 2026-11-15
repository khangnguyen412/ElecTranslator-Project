"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupBackend = exports.stopBackend = exports.startBackend = exports.ensureDependencies = exports.dependenciesStatus = exports.backendProcess = void 0;
/* eslint-disable */
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const config_1 = require("../../config");
exports.backendProcess = null;
exports.dependenciesStatus = { phase: 'idle' };
const RUNTIME_URL = 'https://github.com/khangnguyen412/ElecTranslator-Project/releases/download/runtime-win-v2/runtime-win-v2.zip';
const RUNTIME_SHA256 = 'EF83B17CDFBA14749F1FC711B546841F816F506EA12C74B8824837CB29DF82C7';
const envRoot = () => path_1.default.join(electron_1.app.getPath('userData'), 'python-env');
const sources = () => electron_1.app.isPackaged ? {
    python: path_1.default.join(process.resourcesPath, 'python'),
    wheels: path_1.default.join(process.resourcesPath, 'wheels'),
    scripts: path_1.default.join(process.resourcesPath, 'scripts'),
    backend: path_1.default.join(process.resourcesPath, 'backend')
} : {
    python: path_1.default.join(electron_1.app.getAppPath(), 'resources', 'python'),
    wheels: path_1.default.join(electron_1.app.getAppPath(), 'resources', 'wheels'),
    scripts: path_1.default.join(electron_1.app.getAppPath(), 'resources', 'scripts'),
    backend: path_1.default.join(electron_1.app.getAppPath(), '..', 'backend')
};
/**
 * Ensure runtime is available
 * @param env
 * @param src
 * @returns
 */
const ensureRuntime = async (env, src) => {
    if (fs_1.default.existsSync(path_1.default.join(env, 'python', 'python.exe')) || fs_1.default.existsSync(path_1.default.join(src.python, 'python.exe')))
        return;
    const zip = path_1.default.join(electron_1.app.getPath('userData'), 'runtime-win.zip');
    if (!fs_1.default.existsSync(zip)) {
        exports.dependenciesStatus.message = 'Downloading runtime...';
        const res = await fetch(RUNTIME_URL, { signal: AbortSignal.timeout(20 * 60000) });
        if (!res.ok)
            throw new Error('Runtime URL tra ve ' + res.status);
        const out = fs_1.default.createWriteStream(zip + '.part');
        const total = Number(res.headers.get('content-length') ?? 0);
        let got = 0;
        for await (const chunk of res.body ?? []) {
            const buf = Buffer.from(chunk);
            out.write(buf);
            got += buf.length;
            if (total)
                exports.dependenciesStatus.message = `Downloading runtime... ${Math.round(got / total * 100)}%`;
        }
        await new Promise((r, j) => { out.on('close', r); out.on('error', j); out.close(); });
        const h = (0, crypto_1.createHash)('sha256').update(fs_1.default.readFileSync(zip + '.part')).digest('hex');
        if (h !== RUNTIME_SHA256) {
            fs_1.default.rmSync(zip + '.part');
            throw new Error('SHA256 runtime khong khop');
        }
        fs_1.default.renameSync(zip + '.part', zip);
    }
    exports.dependenciesStatus.message = 'Unpacking runtime...';
    fs_1.default.mkdirSync(env, { recursive: true });
    (0, child_process_1.execSync)(`tar -xf "${zip}" -C "${env}"`);
};
/**
 * Ensure dependencies are available
 * @returns
 */
const ensureDependencies = async () => {
    if (exports.dependenciesStatus.phase === 'installing') {
        return;
    }
    exports.dependenciesStatus.phase = 'installing';
    try {
        const src = sources();
        const env = envRoot();
        const python = path_1.default.join(env, 'python', 'python.exe'); // windows only
        const requirementDeps = path_1.default.join(src.backend, 'requirements.txt');
        const marker = path_1.default.join(env, '.deps_installed');
        const hash = (0, crypto_1.createHash)('md5').update(fs_1.default.readFileSync(requirementDeps)).digest('hex');
        /**
         * Check if dependencies are already installed -> match -> skip installation
         */
        if (fs_1.default.existsSync(marker) && fs_1.default.readFileSync(marker, 'utf-8') === hash) {
            exports.dependenciesStatus.phase = 'ready';
            return;
        }
        /**
         * Kill backend process if running
         * Remove existing environment if it exists
         */
        await killBackend();
        fs_1.default.rmSync(env, { recursive: true, force: true, maxRetries: 5, retryDelay: 1000 });
        await ensureRuntime(env, src);
        for (const item of ['python', 'wheels', 'scripts']) {
            if (fs_1.default.existsSync(src[item]))
                fs_1.default.cpSync(src[item], path_1.default.join(env, item), { recursive: true });
        }
        /**
         * Create python-env/backend/ in userData and copy requirements.txt from backend
         */
        fs_1.default.mkdirSync(path_1.default.join(env, 'backend'), { recursive: true });
        fs_1.default.copyFileSync(requirementDeps, path_1.default.join(env, 'backend', 'requirements.txt'));
        /**
         * Run script to install dependencies
         */
        const log = fs_1.default.createWriteStream(path_1.default.join(env, 'install.log'), { flags: 'a' });
        const child = (0, child_process_1.spawn)(python, ['-s', path_1.default.join(env, 'scripts', 'install_deps.py')]);
        child.stdout.pipe(log);
        child.stderr.pipe(log);
        await new Promise((resolve, reject) => {
            const t = setTimeout(() => { child.kill(); reject(new Error('Install timeout 5 minutes')); }, 5 * 60000);
            child.on('close', (c) => { clearTimeout(t); c === 0 ? resolve() : reject(new Error(`Install exit ${c} — xem ${path_1.default.join(env, 'install.log')}`)); });
            child.on('error', reject);
        });
        /**
         * Install dependencies successfully
         * Write marker file to indicate installation is done for skip reinstall in next time
         */
        fs_1.default.writeFileSync(marker, hash);
        exports.dependenciesStatus = { phase: 'ready' };
    }
    catch (error) {
        exports.dependenciesStatus.phase = 'error';
        exports.dependenciesStatus.message = error.message;
        throw error;
    }
};
exports.ensureDependencies = ensureDependencies;
const killBackend = () => {
    return new Promise((resolve) => {
        if (process.platform === 'win32') {
            /**
             * On Windows
             * Find PID and kill process on port PORT
             */
            const command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr ":${config_1.API_PORT}" ^| findstr "LISTENING"') do taskkill /F /PID %a`;
            (0, child_process_1.exec)(command, (error, stdout, stderr) => {
                if (error) {
                    /**
                     * If no process found, ignore the error
                     */
                    if (!stderr.includes("Could not find any process")) {
                        console.log(`[Cleanup] No process found on port ${config_1.API_PORT} or already cleared.`);
                    }
                }
                else {
                    console.log(`[Cleanup] Successfully killed process on port ${config_1.API_PORT}.`);
                }
                resolve();
            });
        }
        else {
            /**
             * On Unix
             * Find PID and kill process on port PORT
             */
            const command = `lsof -ti :${config_1.API_PORT} | xargs kill -9`;
            (0, child_process_1.exec)(command, (error) => {
                if (error) {
                    console.log(`[Cleanup] No process found on port ${config_1.API_PORT} (Unix).`);
                }
                else {
                    console.log(`[Cleanup] Successfully killed process on port ${config_1.API_PORT}.`);
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
                /**
                 * Stop old backend instance if running
                 */
                if (exports.backendProcess) {
                    console.log('[Backend] Already running.');
                    resolve();
                    return;
                }
                console.log(`[Backend] Ensuring port ${config_1.API_PORT} is free...`);
                await killBackend();
                if (exports.backendProcess) {
                    console.log('[Backend] Already running (won after kill).');
                    resolve();
                    return;
                }
                const backendPath = path_1.default.join(__dirname, '../../../../backend');
                console.log(`[Backend] Starting backend at: ${backendPath}`);
                /**
                 * Spawn new backend process instance if not running
                 */
                exports.backendProcess = (0, child_process_1.spawn)(path_1.default.join(envRoot(), 'python', 'python.exe'), ['-s', '-m', 'uvicorn', 'main:app', '--host', config_1.API_HOST, '--port', config_1.API_PORT], {
                    cwd: backendPath,
                    env: { ...process.env },
                    stdio: ['ignore', 'pipe', 'pipe']
                });
                console.log(`[Backend] Spawned pid ${exports.backendProcess.pid}`);
                let isResolved = false;
                let startupTimeout = undefined;
                exports.backendProcess.stderr?.on('data', (data) => {
                    const log = data.toString().trim();
                    if (log.includes("error while attempting to bind on address")) {
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout)
                                clearTimeout(startupTimeout);
                            console.warn(`[Backend Warning] Port ${config_1.API_PORT} is busy. Assuming it is our old instance or another service.`);
                            /**
                             * Kill the process if it's our old instance or another service
                             */
                            exports.backendProcess?.kill();
                            exports.backendProcess = null;
                            reject(new Error(`[Backend Error] Port ${config_1.API_PORT} is already in use. Please close other instances.`));
                        }
                    }
                    else if (log.includes("Uvicorn running on") || log.includes("Application startup complete")) {
                        console.log(`[Backend Info] ${log}`);
                        if (!isResolved) {
                            isResolved = true;
                            if (startupTimeout)
                                clearTimeout(startupTimeout);
                            resolve();
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
                    /**
                     * Check if backend started successfully
                     */
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
                }, 60000);
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
        /**
         * Send SIGINT to backend process to stop gracefully
         */
        try {
            exports.backendProcess.kill('SIGINT');
        }
        catch (e) {
            console.error('Error sending SIGINT:', e);
        }
        /**
         * Force kill backend process if it's not stopped within 3 seconds
         * Wait for backend process to stop gracefully
         */
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
/**
 * Setup Cleanup backend process when app closes
 */
const cleanupBackend = () => {
    /**
     * Handle cleanup when app closes
     */
    electron_1.app.once('before-quit', () => {
        console.log('App is closing, stopping backend...');
        try {
            exports.backendProcess?.kill('SIGINT');
        }
        catch (e) {
            console.error('Error sending SIGINT:', e);
        }
    });
    /**
     * Handle terminate signals
     */
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
    /**
     * Force-cleanup port PORT when app closes or process exits
     */
    process.on('exit', async () => {
        console.log(`[Cleanup] Force-cleaning port ${config_1.API_PORT}...`);
        try {
            if (process.platform === 'win32') {
                (0, child_process_1.execSync)(`for /f "tokens=5" %a in (\'netstat -ano ^| findstr ":${config_1.API_PORT}" ^| findstr "LISTENING"\') do taskkill /F /PID %a`, { stdio: 'ignore' });
            }
            else {
                (0, child_process_1.execSync)(`lsof -ti :${config_1.API_PORT} | xargs kill -9 2>/dev/null`, { stdio: 'ignore' });
            }
        }
        catch {
            console.log('[Cleanup] No process found — fine');
        }
    });
};
exports.cleanupBackend = cleanupBackend;
