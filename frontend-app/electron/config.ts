import { app } from 'electron';
import fs from 'fs';
import path from 'path';

let env: Record<string, string> = {};

try {
    env = Object.fromEntries(fs.readFileSync(path.join(app.getAppPath(), '.env'), 'utf-8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => l.split(/=(.+)/).slice(0, 2)))
} catch {
    console.log('[config] No .env (packaged) - using defaults 127.0.0.1:4120');
}

export const API_HOST = env['VITE_API_HOST'] || "127.0.0.1"
export const API_PORT = env['VITE_API_PORT'] || "4120"
