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
    try {
        if (!fs.existsSync(filePath)) return undefined;
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        // log error nếu cần
        return undefined;
    }
}

export async function saveToFile(filePath: string, data: any): Promise<void> {
    try {
        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        // handle error if needed
    }
}

export async function loadFromApi(url: string): Promise<any> {
    try {
        const res = await fetch(url);
        if (!res.ok) return undefined;
        return await res.json();
    } catch {
        return undefined;
    }
}

export async function saveToApi(url: string, data: any): Promise<boolean> {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch {
        return false;
    }
}