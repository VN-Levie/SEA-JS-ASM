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
                data.assigneeId,
                data.id,
                data.createdAt ? new Date(data.createdAt) : undefined,
                data.updatedAt ? new Date(data.updatedAt) : undefined
            );
        });
    }

    async saveTasks(tasks: Task[]): Promise<void> {
        await this.writeFile(TASKS_FILE_PATH, tasks);
    }

    async loadUsers(): Promise<User[]> {
         return this.readFile<User>(USERS_FILE_PATH, (data: any) => {
            return new User(
                data.name,
                data.email,
                data.id
            );
        });
    }

    async saveUsers(users: User[]): Promise<void> {
        await this.writeFile(USERS_FILE_PATH, users);
    }
}