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

        // Try 1: Direct join from app root
        const sourcePath = path.join(appPath, 'electron', 'module', baseDir, filePath);
        if (fs.existsSync(sourcePath)) {
            return sourcePath;
        }

        // Try 2: Fallback using __dirname
        const dirname = path.join(__dirname.replace('dist-electron', 'electron').replace('dist', 'electron'), 'module', baseDir, filePath);
        if (fs.existsSync(dirname)) {
            return dirname;
        }

        // Try 3: Last resort - current working directory
        return path.join(process.cwd(), 'electron', 'module', baseDir, filePath);
    } else {
        // Production: resources copied to app.asar.unpacked or resourcesPath
        return path.join(process.resourcesPath, baseDir, filePath);
    }
}

export const getResourcePythonPath = (filePath: string): string => {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    if (isDev) {
        const appPath = app.getAppPath();

        // Try 1: Direct join from app root
        const pythonPath = path.join(appPath, '..', 'python', filePath);
        if (fs.existsSync(pythonPath)) {
            return pythonPath;
        }

        // Try 2: Fallback using __dirname with path traversal
        // dist-electron -> frontend-app/python
        const dirnamePath = path.join(__dirname.replace('dist-electron', '').replace('dist', '').replace(/electron[/]utils[/]?$/, ''), 'python', filePath);
        if (fs.existsSync(dirnamePath)) {
            return dirnamePath;
        }

        // Try 3: Last resort - relative to cwd
        return path.join(process.cwd(), 'python', filePath);
    } else {
        // Production: resources copied to app.asar.unpacked or resourcesPath
        return path.join(process.resourcesPath, 'python', filePath);
    }
}