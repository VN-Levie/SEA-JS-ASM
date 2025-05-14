import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { User } from '../models/User';
import { IStorageService } from './storage/IStorageService';
import { LogExecution, LogMethodIO } from '../decorators/loggingDecorators';

export class TaskManager {
    private tasks: Task[] = [];
    private users: User[] = [];
    private static instance: TaskManager;

    private constructor(private storageService: IStorageService) { }

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
        assigneeId?: number
    ): Promise<Task> {
        const newTask = new Task(title, description, TaskStatus.ToDo, priority, dueDate, assigneeId);
        this.tasks.push(newTask);
        return newTask;
    }

    @LogMethodIO
    public getTaskById(id: number): Task {
        var task = new Task('test', 'test', TaskStatus.ToDo, TaskPriority.Low);
        for (let index = 0; index < this.tasks.length; index++) {
            if (index == 0) {
                console.log('Is task an instance of this.tasks[index]?', this.tasks[index] instanceof Task);
                console.log('Type of his.tasks[index]:', typeof this.tasks[index]);
            }
            const element: Task = this.tasks[index];
            if (element.id === id) {
                console.log('Is task an instance of element?', element instanceof Task);
                console.log('Type of element:', typeof element);
                return element;
            }
        }
        return task;
    }

    public getAllTasks(): Task[] {
        return [...this.tasks];
    }

    @LogMethodIO
    public async updateTask(id: number, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | undefined> {
        const task: Task = this.getTaskById(id);
        const element: Task = this.tasks[0];

        if (task) {
            task.update(updates);
            return task;
        }
        return undefined;
    }

    @LogMethodIO
    public async deleteTask(id: number): Promise<boolean> {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        if (this.tasks.length < initialLength) {
            return true;
        }
        return false;
    }

    @LogMethodIO
    public async assignTaskToUser(taskId: number, userId: number): Promise<Task | undefined> {
        const task = this.getTaskById(taskId);
        const user = this.getUserById(userId);
        if (task && user) {
            task.assigneeId = user.id;
            task.updatedAt = new Date();
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
        return newUser;
    }

    public getAllUsers(): User[] {
        return [...this.users];
    }

    public getUserById(id: number): User | undefined {
        return this.users.find(user => user.id === id);
    }

    public async saveAllTasks(): Promise<void> {
        await this.storageService.saveTasks(this.tasks);
    }

    public async saveAllUsers(): Promise<void> {
        await this.storageService.saveUsers(this.users);
    }

    public async saveAll(): Promise<void> {
        await this.saveAllTasks();
        await this.saveAllUsers();
    }
}
