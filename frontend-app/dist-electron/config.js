"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_PORT = exports.API_HOST = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let env = {};
try {
    env = Object.fromEntries(fs_1.default.readFileSync(path_1.default.join(electron_1.app.getAppPath(), '.env'), 'utf-8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => l.split(/=(.+)/).slice(0, 2)));
}
catch {
    console.log('[config] No .env (packaged) - using defaults 127.0.0.1:4120');
}
exports.API_HOST = env['VITE_API_HOST'] || "127.0.0.1";
exports.API_PORT = env['VITE_API_PORT'] || "4120";
