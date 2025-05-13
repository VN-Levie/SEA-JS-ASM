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