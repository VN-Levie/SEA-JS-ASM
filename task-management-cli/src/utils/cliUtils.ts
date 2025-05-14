import Table from 'cli-table3';
import chalk from 'chalk';
import { Task, TaskPriority, TaskStatus } from '../models/Task';
import { User } from '../models/User';
import { formatDate } from './dateUtils';

export function displayTasks(tasks: Task[]): void {
    if (tasks.length === 0) {
        console.log(chalk.yellow('\nNo tasks to display.'));
        return;
    }

    const table = new Table({
        head: [
            chalk.cyanBright.bold('ID'),
            chalk.cyanBright.bold('Title'),
            chalk.cyanBright.bold('Status'),
            chalk.cyanBright.bold('Priority'),
            chalk.cyanBright.bold('Due Date'),
            chalk.cyanBright.bold('Assignee ID'),
            chalk.cyanBright.bold('Description')
        ],
        colWidths: [38, 30, 15, 12, 15, 38, 40],
        wordWrap: true
    });

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

        table.push([
            task.id,
            task.title,
            statusColor(task.status),
            priorityColor(task.priority),
            formatDate(task.dueDate),
            task.assigneeId || chalk.dim('N/A'),
            task.description || chalk.dim('N/A')
        ]);
    });
    console.log("\n" + table.toString());
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