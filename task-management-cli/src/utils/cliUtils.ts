import Table from 'cli-table3';
import chalk from 'chalk';
import { Task, TaskPriority, TaskStatus } from '../models/Task';
import { User } from '../models/User';
import { formatDate } from './dateUtils';

export function displayTasks(tasks: Task[]): void {
    if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks to display.'));
        return;
    }

    const table = new Table({
        head: [
            chalk.cyan('ID'),
            chalk.cyan('Title'),
            chalk.cyan('Status'),
            chalk.cyan('Priority'),
            chalk.cyan('Due Date'),
            chalk.cyan('Assignee ID'),
        ],
        colWidths: [38, 30, 15, 12, 15, 38]
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
            task.assigneeId || 'N/A',
        ]);
    });
    console.log(table.toString());
}

export function displayUsers(users: User[]): void {
     if (users.length === 0) {
        console.log(chalk.yellow('No users to display.'));
        return;
    }
    const table = new Table({
        head: [chalk.cyan('ID'), chalk.cyan('Name'), chalk.cyan('Email')],
        colWidths: [38, 30, 30]
    });
    users.forEach(user => {
        table.push([user.id, user.name, user.email || 'N/A']);
    });
    console.log(table.toString());
}

export function printMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    switch (type) {
        case 'success':
            console.log(chalk.green(message));
            break;
        case 'error':
            console.log(chalk.red(message));
            break;
        case 'warning':
            console.log(chalk.yellow(message));
            break;
        case 'info':
        default:
            console.log(chalk.blue(message));
            break;
    }
}