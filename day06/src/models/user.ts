import { Book } from './book';

export class User {
    public readonly id: number;
    public name: string;
    public age: number;

    constructor(id: number, name: string, age: number) {
        this.id = id;
        this.name = name;
        this.age = age;
    }

    public countBorrowedBooks(books: Book[]): number {
        return books.reduce((count, b) => b.borrowedBy && b.borrowedBy.includes(this.id) ? count + 1 : count, 0);
    }

    public canBorrow(books: Book[], maxBorrow: number): boolean {
        return this.countBorrowedBooks(books) < maxBorrow;
    }

    public toJSON() {
        return {
            id: this.id,
            name: this.name,
            age: this.age
        };
    }
}