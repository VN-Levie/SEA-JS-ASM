export function formatDate(date: Date | undefined, format: string = 'YYYY-MM-DD'): string {
    if (!date) return 'N/A';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    }
    return date.toLocaleDateString();
}

export function parseNaturalDate(input: string): Date | undefined {
    if (!input || typeof input !== 'string') return undefined;
    const now = new Date();

    // YYYY-MM-DD
    const ymd = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
        const date = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
        if (!isNaN(date.getTime())) return date;
        return undefined;
    }

    // "1 day", "7 days", "1 month", "12h", "3 hours", "2 weeks"
    const rel = input.match(/^(\d+)\s*(day|days|month|months|hour|hours|h|week|weeks)$/i);
    if (rel) {
        const value = parseInt(rel[1], 10);
        const unit = rel[2].toLowerCase();
        const date = new Date(now);
        switch (unit) {
            case 'day':
            case 'days':
                date.setDate(now.getDate() + value);
                return date;
            case 'week':
            case 'weeks':
                date.setDate(now.getDate() + value * 7);
                return date;
            case 'month':
            case 'months':
                date.setMonth(now.getMonth() + value);
                return date;
            case 'hour':
            case 'hours':
            case 'h':
                date.setHours(now.getHours() + value);
                return date;
        }
    }

    // "12h"
    const hourShort = input.match(/^(\d+)\s*h$/i);
    if (hourShort) {
        const value = parseInt(hourShort[1], 10);
        const date = new Date(now);
        date.setHours(now.getHours() + value);
        return date;
    }

    // "this last month"
    if (/this\s+last\s+month/i.test(input)) {
        const date = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return date;
    }

    // Try Date.parse fallback
    const parsed = Date.parse(input);
    if (!isNaN(parsed)) {
        return new Date(parsed);
    }

    return undefined;
}