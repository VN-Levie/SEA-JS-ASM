import { LogClassCreation } from '../decorators/loggingDecorators';
import { generateUUID } from '../utils/idGenerator';

export enum TaskStatus {
    ToDo = 'TO_DO',
    InProgress = 'IN_PROGRESS',
    Done = 'DONE',
    Cancelled = 'CANCELLED',
}

export enum TaskPriority {
    Low = 'LOW',
    Medium = 'MEDIUM',
    High = 'HIGH',
}

@LogClassCreation
export class Task {
    public readonly id: string;
    public title: string;
    public description?: string;
    public status: TaskStatus;
    public priority: TaskPriority;
    public dueDate?: Date;
    public readonly createdAt: Date;
    public updatedAt: Date;
    public assigneeId?: string;

    constructor(
        title: string,
        description?: string,
        status: TaskStatus = TaskStatus.ToDo,
        priority: TaskPriority = TaskPriority.Medium,
        dueDate?: Date,
        assigneeId?: string,
        id?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this.id = id || generateUUID();
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.assigneeId = assigneeId;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    public update(updates: Partial<Omit<Task, 'id' | 'createdAt'>>) {
        Object.assign(this, updates);
        this.updatedAt = new Date();
    }

    public isOverdue(): boolean {
        return this.dueDate ? this.dueDate < new Date() && this.status !== TaskStatus.Done : false;
    }
}