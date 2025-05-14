import { IStorageService } from './IStorageService';
import { Task } from '../../models/Task';
import { User } from '../../models/User';

export class ApiService implements IStorageService {
    constructor(private apiKey?: string) {}

    async loadTasks(): Promise<Task[]> {
        throw new Error('ApiService.loadTasks() not implemented yet.');
    }

    async saveTasks(tasks: Task[]): Promise<void> {
        throw new Error('ApiService.saveTasks() not implemented yet.');
    }

    async loadUsers(): Promise<User[]> {
        throw new Error('ApiService.loadUsers() not implemented yet.');
    }

    async saveUsers(users: User[]): Promise<void> {
        throw new Error('ApiService.saveUsers() not implemented yet.');
    }
}