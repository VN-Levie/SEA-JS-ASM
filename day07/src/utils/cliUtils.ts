import chalk from 'chalk';
import { formatDate } from './dateUtils';

export function printMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    let coloredMessage: string;
    switch (type) {
        case 'success':
            coloredMessage = chalk.bold.green(`✓ ${message}`);
            break;
        case 'error':
            coloredMessage = chalk.bold.red(`✗ ${message}`);
            break;
        case 'warning':
            coloredMessage = chalk.bold.yellow(`⚠ ${message}`);
            break;
        case 'info':
        default:
            coloredMessage = chalk.bold.blue(`ℹ ${message}`);
            break;
    }
    console.log(`\n${coloredMessage}`);
}