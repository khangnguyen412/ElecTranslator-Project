"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBackendUtilsPath = exports.getResourceElectronPath = void 0;
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
        /**
         * Direct join from app root
         */
        const sourcePath = path_1.default.join(appPath, 'electron', 'module', baseDir, filePath);
        if (fs_1.default.existsSync(sourcePath)) {
            return sourcePath;
        }
        /**
         * Fallback using __dirname
         */
        const dirname = path_1.default.join(__dirname.replace('dist-electron', 'electron').replace('dist', 'electron'), 'module', baseDir, filePath);
        if (fs_1.default.existsSync(dirname)) {
            return dirname;
        }
        /**
         * Last resort - current working directory
         */
        return path_1.default.join(process.cwd(), 'electron', 'module', baseDir, filePath);
    }
    else {
        /**
         * Production: resources copied to app.asar.unpacked or resourcesPath
         */
        return path_1.default.join(process.resourcesPath, baseDir, filePath);
    }
};
exports.getResourceElectronPath = getResourceElectronPath;
/**
 * Get backend utils path
 */
const getBackendUtilsPath = () => {
    /**
     * In dev environment, __dirname is usually dist-electron/module/checking
     * We need to go back 3 levels: checking -> module -> dist-electron -> frontend-app -> root -> backend/utils
     */
    const devPath = path_1.default.join(__dirname, '../../../backend/utils/check_dependencies.py');
    /**
     * Note: When building (packaging), the structure may change.
     * You may need to copy check_dependencies.py to resources folder or handle production path separately.
     */
    return devPath;
};
exports.getBackendUtilsPath = getBackendUtilsPath;
