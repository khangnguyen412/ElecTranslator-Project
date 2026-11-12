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