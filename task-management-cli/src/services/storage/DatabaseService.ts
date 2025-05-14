import { IStorageService } from './IStorageService';
import { Task } from '../../models/Task';
import { User } from '../../models/User';

export class DatabaseService implements IStorageService {
    constructor(connectionString: string) {}

    async loadTasks(): Promise<Task[]> {
        throw new Error('DatabaseService.loadTasks() not implemented yet.');
    }

    async saveTasks(tasks: Task[]): Promise<void> {
        throw new Error('DatabaseService.saveTasks() not implemented yet.');
    }

    async loadUsers(): Promise<User[]> {
        throw new Error('DatabaseService.loadUsers() not implemented yet.');
    }

    async saveUsers(users: User[]): Promise<void> {
        throw new Error('DatabaseService.saveUsers() not implemented yet.');
    }
}