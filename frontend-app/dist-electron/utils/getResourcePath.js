"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResourcePythonPath = exports.getResourceElectronPath = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Helper: Resolve path to resources folder (dev & prod)
 */
const getResourceElectronPath = (baseDir, filePath) => {
    const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
    if (isDev) {
        const appPath = electron_1.app.getAppPath();
        // Try 1: Direct join from app root
        const sourcePath = path_1.default.join(appPath, 'electron', 'module', baseDir, filePath);
        if (fs_1.default.existsSync(sourcePath)) {
            return sourcePath;
        }
        // Try 2: Fallback using __dirname
        const dirname = path_1.default.join(__dirname.replace('dist-electron', 'electron').replace('dist', 'electron'), 'module', baseDir, filePath);
        if (fs_1.default.existsSync(dirname)) {
            return dirname;
        }
        // Try 3: Last resort - current working directory
        return path_1.default.join(process.cwd(), 'electron', 'module', baseDir, filePath);
    }
    else {
        // Production: resources copied to app.asar.unpacked or resourcesPath
        return path_1.default.join(process.resourcesPath, baseDir, filePath);
    }
};
exports.getResourceElectronPath = getResourceElectronPath;
const getResourcePythonPath = (filePath) => {
    const isDev = process.env.NODE_ENV === 'development' || !electron_1.app.isPackaged;
    if (isDev) {
        const appPath = electron_1.app.getAppPath();
        // Try 1: Direct join from app root
        const pythonPath = path_1.default.join(appPath, '..', 'python', filePath);
        if (fs_1.default.existsSync(pythonPath)) {
            return pythonPath;
        }
        // Try 2: Fallback using __dirname with path traversal
        // dist-electron -> frontend-app/python
        const dirnamePath = path_1.default.join(__dirname.replace('dist-electron', '').replace('dist', '').replace(/electron[/]utils[/]?$/, ''), 'python', filePath);
        if (fs_1.default.existsSync(dirnamePath)) {
            return dirnamePath;
        }
        // Try 3: Last resort - relative to cwd
        return path_1.default.join(process.cwd(), 'python', filePath);
    }
    else {
        // Production: resources copied to app.asar.unpacked or resourcesPath
        return path_1.default.join(process.resourcesPath, 'python', filePath);
    }
};
exports.getResourcePythonPath = getResourcePythonPath;
