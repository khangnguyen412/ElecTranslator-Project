import { readFileSync } from 'fs';
import { getResourcePythonPath } from './getResourcePath'

export const parseRequirement = () => {
    const requirePath = getResourcePythonPath('requirements.txt');
    try {
        // Parse requirements.txt
        return readFileSync(requirePath, 'utf-8')
            .split('\n').map(ln => ln.trim())
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#') && !line.startsWith('-'))
            .map(line => line.split(/[=><!~[]/)[0].trim().toLowerCase());
    } catch {
        throw new Error('Failed to parse requirements.txt'); // Fallback
    }
}