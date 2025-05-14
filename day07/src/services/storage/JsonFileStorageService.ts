import { promises as fs } from 'fs';
import path from 'path';
import { IStorageService } from './IStorageService';
import { Task, TaskStatus, TaskPriority } from '../../models/Task';
import { User } from '../../models/User';

const TASKS_FILE_PATH = path.join(__dirname, '../../../data/tasks.json');
const USERS_FILE_PATH = path.join(__dirname, '../../../data/users.json');

async function ensureDataDirectoryExists() {
    try {
        await fs.mkdir(path.dirname(TASKS_FILE_PATH), { recursive: true });
    } catch (error) {
        console.error("Error creating data directory:", error);
    }
}

export class JsonFileStorageService implements IStorageService {
    constructor() {
        ensureDataDirectoryExists();
    }

    private async readFile<T>(filePath: string, reconstructor?: (data: any) => T): Promise<T[]> {
        try {
            await fs.access(filePath);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            if (!fileContent.trim()) return [];
            const items = JSON.parse(fileContent);
            if (reconstructor && Array.isArray(items)) {
                return items.map(item => reconstructor(item));
            }
            return items as T[];
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return [];
            }
            console.error(`Error reading or parsing file ${filePath}:`, error);
            return [];
        }
    }

    private async writeFile<T>(filePath: string, data: T[]): Promise<void> {
        try {
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (error) {
            console.error(`Error writing file ${filePath}:`, error);
            throw error;
        }
    }

    async loadTasks(): Promise<Task[]> {
        return this.readFile<Task>(TASKS_FILE_PATH, (data: any) => {          
            return new Task(
                data.title,
                data.description,
                data.status as TaskStatus,
                data.priority as TaskPriority,
                data.dueDate ? new Date(data.dueDate) : undefined,
                typeof data.assigneeId === 'number' ? data.assigneeId : undefined,
                typeof data.id === 'number' ? data.id : undefined,
                data.createdAt ? new Date(data.createdAt) : new Date(),
                data.updatedAt ? new Date(data.updatedAt) : new Date()
            );
        });
    }

    async saveTasks(tasks: Task[]): Promise<void> {
        const plainTasks = tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.toISOString() : null,
            assigneeId: typeof task.assigneeId === 'number' ? task.assigneeId : undefined,
            createdAt: task.createdAt ? task.createdAt.toISOString() : null,
            updatedAt: task.updatedAt ? task.updatedAt.toISOString() : null
        }));
        await this.writeFile(TASKS_FILE_PATH, plainTasks);
    }

    async loadUsers(): Promise<User[]> {
         return this.readFile<User>(USERS_FILE_PATH, (data: any) => {
            return new User(
                data.name,
                data.email,
                typeof data.id === 'number' ? data.id : undefined
            );
        });
    }

    async saveUsers(users: User[]): Promise<void> {
        const plainUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email
        }));
        await this.writeFile(USERS_FILE_PATH, plainUsers);
    }
}