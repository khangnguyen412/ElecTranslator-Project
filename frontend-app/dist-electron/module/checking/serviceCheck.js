"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPythonLibraryRequirements = exports.checkPythonVersion = void 0;
/* eslint-disable */
const child_process_1 = require("child_process");
const getResourcePath_1 = require("../../utils/getResourcePath");
const checkPythonVersion = async () => {
    const conmands = ['python3', 'python'];
    for (const cmd of conmands) {
        try {
            const result = await new Promise((resolve) => {
                const python = (0, child_process_1.spawn)(cmd, ['--version'], { shell: true });
                let output = '';
                python.stderr.on('data', (data) => { output += data.toString(); });
                python.stdout.on('data', (data) => { output += data.toString(); });
                python.on('close', (code) => {
                    /**
                     * check if code is 0, python version check is success, else return checking with message
                     */
                    if (code === 0) {
                        /**
                         * match python version from output (output: Python x.x.x)
                         * if match, return version
                         * if not match, return error with message
                         */
                        const match = output.match(/Python (\d+\.\d+\.\d+)/i);
                        if (match) {
                            /**
                             * get version from match (match[1] == version)
                             */
                            const version = match[1];
                            /**
                             * Check if version starts with 3.11, if yes return success, otherwise return error with message
                             */
                            if (version.startsWith('3.11')) {
                                resolve({ status: 'success', version, message: `Python ${version} detected` });
                            }
                            else {
                                resolve({ status: 'error', message: `Found ${version}, but 3.11.x is required` });
                            }
                        }
                        else {
                            resolve({ status: 'error', message: 'Unable to parse Python version' });
                        }
                    }
                    else {
                        resolve({ status: 'checking', message: `${cmd} check failed, trying fallback` });
                    }
                });
                setTimeout(() => {
                    python.kill();
                    resolve({ status: 'timeout', message: `${cmd} check timed out` });
                }, 3000);
            });
            /**
             * check if result status is checking, if yes continue next command
             */
            if (result.status !== 'checking')
                return result;
        }
        catch {
            continue;
        }
    }
    return { status: 'error', message: 'not found python in system' };
};
exports.checkPythonVersion = checkPythonVersion;
/**
 * Check if required Python libraries are installed
 * @returns Promise<any>
 */
const checkPythonLibraryRequirements = async () => {
    return new Promise((resolve) => {
        /**
         * Get backend/utils/check_deps.py path
         */
        const scriptPath = (0, getResourcePath_1.getBackendUtilsPath)();
        /**
         * Spawn python process to check check_deps.py
         */
        const python = (0, child_process_1.spawn)('python', [scriptPath], { shell: true });
        let output = '';
        python.stdout.on('data', (d) => { output += d.toString(); });
        let errorOutput = '';
        python.stderr.on('data', (d) => { errorOutput += d.toString(); });
        python.on('close', (code) => {
            try {
                if (!output.trim()) {
                    throw new Error(`Empty output from Python script. Error: ${errorOutput}`);
                }
                const res = JSON.parse(output.trim());
                const missing = res.missing || [];
                const installed = res.installed || [];
                resolve({
                    status: missing.length === 0 ? 'success' : 'error',
                    installed: installed,
                    missing: missing
                });
            }
            catch (error) {
                console.error("Dependency check error:", errorOutput);
                resolve({
                    status: 'error',
                    installed: [],
                    missing: ["fastapi", "uvicorn"] // Fallback list
                });
            }
        });
        setTimeout(() => {
            python.kill();
            resolve({ status: 'timeout', installed: [], missing: [] });
        }, 5000);
    });
};
exports.checkPythonLibraryRequirements = checkPythonLibraryRequirements;
