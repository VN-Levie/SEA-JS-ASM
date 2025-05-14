import { LogClassCreation } from '../decorators/loggingDecorators';

@LogClassCreation
export class User {
    private static nextId = 1;
    public readonly id: number;
    public name: string;
    public email?: string;

    constructor(name: string, email?: string, id?: number) {
        if (typeof id === 'number') {
            this.id = id;
            if (id >= User.nextId) {
                User.nextId = id + 1;
            }
        } else {
            this.id = User.nextId++;
        }
        this.name = name;
        this.email = email;
    }
}