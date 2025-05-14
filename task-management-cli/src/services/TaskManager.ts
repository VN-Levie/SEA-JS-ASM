import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { User } from '../models/User';
import { IStorageService } from './storage/IStorageService';
import { Singleton } from '../decorators/singletonDecorator';
import { LogExecution, LogMethodIO } from '../decorators/loggingDecorators';

@Singleton
export class TaskManager {
    private tasks: Task[] = [];
    private users: User[] = [];
    private static instance: TaskManager;

    private constructor(private storageService: IStorageService) {}
    
    public static getInstance(storageService: IStorageService): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager(storageService);
        }
        return TaskManager.instance;
    }

    @LogExecution
    public async initialize(): Promise<void> {
        try {
            this.tasks = await this.storageService.loadTasks();
            this.users = await this.storageService.loadUsers();
        } catch (error) {
            this.tasks = [];
            this.users = [];
        }
    }

    @LogMethodIO
    public async addTask(
        title: string,
        description?: string,
        priority?: TaskPriority,
        dueDate?: Date,
        assigneeId?: string
    ): Promise<Task> {
        const newTask = new Task(title, description, TaskStatus.ToDo, priority, dueDate, assigneeId);
        this.tasks.push(newTask);
        await this.storageService.saveTasks(this.tasks);
        return newTask;
    }

    @LogMethodIO
    public getTaskById(id: string): Task | undefined {
        return this.tasks.find(task => task.id === id);
    }

    public getAllTasks(): Task[] {
        return [...this.tasks];
    }

    @LogMethodIO
    public async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | undefined> {
        const task = this.getTaskById(id);
        if (task) {
            task.update(updates);
            await this.storageService.saveTasks(this.tasks);
            return task;
        }
        return undefined;
    }

    @LogMethodIO
    public async deleteTask(id: string): Promise<boolean> {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        if (this.tasks.length < initialLength) {
            await this.storageService.saveTasks(this.tasks);
            return true;
        }
        return false;
    }
    
    @LogMethodIO
    public async assignTaskToUser(taskId: string, userId: string): Promise<Task | undefined> {
        const task = this.getTaskById(taskId);
        const user = this.getUserById(userId);
        if (task && user) {
            task.assigneeId = user.id;
            task.updatedAt = new Date();
            await this.storageService.saveTasks(this.tasks);
            return task;
        }
        return undefined;
    }

    @LogMethodIO
    public getTasksByStatus(status: TaskStatus): Task[] {
        return this.tasks.filter(task => task.status === status);
    }

    @LogMethodIO
    public getTasksByPriority(priority: TaskPriority): Task[] {
        return this.tasks.filter(task => task.priority === priority);
    }
    
    @LogMethodIO
    public async addUser(name: string, email?: string): Promise<User> {
        const newUser = new User(name, email);
        this.users.push(newUser);
        await this.storageService.saveUsers(this.users);
        return newUser;
    }

    public getAllUsers(): User[] {
        return [...this.users];
    }

    public getUserById(id: string): User | undefined {
        return this.users.find(user => user.id === id);
    }
}
