import { isPositiveInteger, isNonEmptyString } from '../commons/utils';
import { Book } from './book';

export class User {
    public readonly id: number;
    public name: string;
    public age: number;

    constructor(id: number, name: string, age: number) {
        if (!isPositiveInteger(String(id))) {
            throw new Error('User ID must be a positive integer.');
        }
        if (!isNonEmptyString(name)) {
            throw new Error('User name cannot be empty.');
        }
        if (!isPositiveInteger(String(age)) || age <= 0) {
            throw new Error('User age must be a positive integer.');
        }
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public countBorrowedBooks(books: Book[]): number {
        return books.reduce((count, book) => {
            if (book.isBorrowedByUser(this.id)) {
                return count + 1;
            }
            return count;
        }, 0);
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            age: this.age,
        };
    }
}