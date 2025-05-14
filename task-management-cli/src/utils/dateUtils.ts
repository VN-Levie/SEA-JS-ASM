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