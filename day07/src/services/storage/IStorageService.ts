import { Task } from '../../models/Task';
import { User } from '../../models/User';

export interface IStorageService {
    loadTasks(): Promise<Task[]>;
    saveTasks(tasks: Task[]): Promise<void>;
    loadUsers(): Promise<User[]>;
    saveUsers(users: User[]): Promise<void>;
}