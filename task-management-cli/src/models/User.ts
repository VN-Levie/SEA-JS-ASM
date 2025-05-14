import { LogClassCreation } from '../decorators/loggingDecorators';
import { generateUUID } from '../utils/idGenerator';

@LogClassCreation
export class User {
    public readonly id: string;
    public name: string;
    public email?: string;

    constructor(name: string, email?: string, id?: string) {
        this.id = id || generateUUID();
        this.name = name;
        this.email = email;
    }
}