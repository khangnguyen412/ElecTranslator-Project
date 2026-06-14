import { app } from 'electron';
import path from 'path';
import fs from 'fs';

/**
 * Helper: Resolve path to resources folder (dev & prod)
 */
export const getResourceElectronPath = (baseDir: string, filePath: string): string => {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    if (isDev) {
        const appPath = app.getAppPath();

        /**
         * Direct join from app root
         */
        const sourcePath = path.join(appPath, 'electron', 'module', baseDir, filePath);
        if (fs.existsSync(sourcePath)) {
            return sourcePath;
        }

        /**
         * Fallback using __dirname
         */
        const dirname = path.join(__dirname.replace('dist-electron', 'electron').replace('dist', 'electron'), 'module', baseDir, filePath);
        if (fs.existsSync(dirname)) {
            return dirname;
        }

        /**
         * Last resort - current working directory
         */
        return path.join(process.cwd(), 'electron', 'module', baseDir, filePath);
    } else {
        /**
         * Production: resources copied to app.asar.unpacked or resourcesPath
         */
        return path.join(process.resourcesPath, baseDir, filePath);
    }
}

/**
 * Get backend utils path
 */
export const getBackendUtilsPath = () => {
    /**
     * In dev environment, __dirname is usually dist-electron/module/checking
     * We need to go back 3 levels: checking -> module -> dist-electron -> frontend-app -> root -> backend/utils
     */
    const devPath = path.join(__dirname, '../../../backend/utils/check_dependencies.py');

    /**
     * Note: When building (packaging), the structure may change.
     * You may need to copy check_dependencies.py to resources folder or handle production path separately.
     */
    return devPath;
};