import chalk from 'chalk';
import Table from 'cli-table3';
import { Task, TaskPriority, TaskStatus } from '../models/Task';
import { User } from '../models/User';
import { formatDate } from './dateUtils';

export function displayTasks(tasks: Task[]): void {
    if (tasks.length === 0) {
        console.log(chalk.yellow('\nNo tasks to display.'));
        return;
    }

    console.log(chalk.bold.cyanBright('\n=== Task List ==='));
    tasks.forEach(task => {
        let statusColor = chalk.white;
        switch (task.status) {
            case TaskStatus.ToDo: statusColor = chalk.yellow; break;
            case TaskStatus.InProgress: statusColor = chalk.blue; break;
            case TaskStatus.Done: statusColor = chalk.green; break;
            case TaskStatus.Cancelled: statusColor = chalk.gray; break;
        }

        let priorityColor = chalk.white;
        switch (task.priority) {
            case TaskPriority.Low: priorityColor = chalk.greenBright; break;
            case TaskPriority.Medium: priorityColor = chalk.yellowBright; break;
            case TaskPriority.High: priorityColor = chalk.redBright; break;
        }

        console.log(
            chalk.bold('ID: ') + chalk.cyan(task.id) + '\n' +
            chalk.bold('Title: ') + chalk.white(task.title) + '\n' +
            chalk.bold('Status: ') + statusColor(task.status) + '\n' +
            chalk.bold('Priority: ') + priorityColor(task.priority) + '\n' +
            chalk.bold('Due Date: ') + chalk.magenta(formatDate(task.dueDate)) + '\n' +
            chalk.bold('Assignee ID: ') + (task.assigneeId !== undefined ? chalk.cyan(task.assigneeId) : chalk.dim('N/A')) + '\n' +
            chalk.bold('Description: ') + (task.description ? chalk.white(task.description) : chalk.dim('N/A')) + '\n' +
            chalk.dim('─'.repeat(40))
        );
    });
}

export function displayUsers(users: User[]): void {
    if (users.length === 0) {
        console.log(chalk.yellow('\nNo users to display.'));
        return;
    }
    const table = new Table({
        head: [chalk.cyanBright.bold('ID'), chalk.cyanBright.bold('Name'), chalk.cyanBright.bold('Email')],
        colWidths: [38, 30, 30]
    });
    users.forEach(user => {
        table.push([user.id, user.name, user.email || chalk.dim('N/A')]);
    });
    console.log("\n" + table.toString());
}

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