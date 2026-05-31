"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequirement = void 0;
const fs_1 = require("fs");
const getResourcePath_1 = require("./getResourcePath");
const parseRequirement = () => {
    const requirePath = (0, getResourcePath_1.getResourcePythonPath)('requirements.txt');
    try {
        // Parse requirements.txt
        return (0, fs_1.readFileSync)(requirePath, 'utf-8')
            .split('\n').map(ln => ln.trim())
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#') && !line.startsWith('-'))
            .map(line => line.split(/[=><!~[]/)[0].trim().toLowerCase());
    }
    catch {
        throw new Error('Failed to parse requirements.txt'); // Fallback
    }
};
exports.parseRequirement = parseRequirement;
