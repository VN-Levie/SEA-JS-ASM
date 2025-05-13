import * as fs from 'fs';

export function isPositiveInteger(value: string): boolean {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
}

export function isNonEmptyString(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

export function parseIntSafe(value: string, defaultValue = 0): number {
    const n = parseInt(value);
    return isNaN(n) ? defaultValue : n;
}

export function readJSON(filePath: string): any {
    if (!fs.existsSync(filePath)) return undefined;
    const raw = fs.readFileSync(filePath, 'utf-8');
    try {
        return JSON.parse(raw);
    } catch {
        return undefined;
    }
}