function formatMoneyString(value) {
    return value.toString().replace(/[0-9](?=([0-9]{3})+(\.|$))/g, '$&,');
}
function countWords(str) {
    let count = 1;
    for (let i = 1; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 65 && code <= 90) count++; // nếu gặp A-Z
    }
    return str.length === 0 ? 0 : count;
}
function formatMoneyShort(value) {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + 'B';
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + 'M';
    if (value >= 1_000) return (value / 1_000).toFixed(2) + 'K';
    return value.toString();
}
function getExtension(filename) {
    const idx = filename.lastIndexOf(".");
    return idx !== -1 ? filename.slice(idx + 1) : "";
}
// test
console.log("formatMoneyString(1234567890): " + formatMoneyString(1234567890)); // 1,234,567,890
console.log("formatMoneyShort(1234567890): " + formatMoneyShort(1234567890)); // 1.23B
console.log("countWords('Hello World!'): " + countWords('Hello World!')); // 2
console.log("countWords('getHTTPResponse'): " + countWords('getHTTPResponse')); // 2
console.log("getExtension('file.txt'): " + getExtension('file.txt')); // txt
console.log("getExtension('file'): " + getExtension('file')); // ""