import { Book, BookStatus, BorrowRecord } from './Book';
import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(__dirname, '..', 'books.json');
const USER_PATH = path.join(__dirname, '..', 'users.json');
const MAX_BORROW_PER_USER = 3;

export interface User {
    readonly id: number;
    name: string;
    age: number;
}

export class Library {
    private books: Book[] = [];
    private users: User[] = [];

    constructor() {
        this.loadFromFile();
        this.loadUsersFromFile();
    }

    private loadFromFile(): void {
        if (fs.existsSync(DATA_PATH)) {
            const raw = fs.readFileSync(DATA_PATH, 'utf-8');
            this.books = JSON.parse(raw);
        } else {
            this.books = [];
        }
    }

    private saveToFile(): void {
        fs.writeFileSync(DATA_PATH, JSON.stringify(this.books, null, 2), 'utf-8');
    }

    private loadUsersFromFile(): void {
        if (fs.existsSync(USER_PATH)) {
            const raw = fs.readFileSync(USER_PATH, 'utf-8');
            this.users = JSON.parse(raw);
        } else {
            this.users = [];
        }
    }

    private saveUsersToFile(): void {
        fs.writeFileSync(USER_PATH, JSON.stringify(this.users, null, 2), 'utf-8');
    }

    addBook(book: Book): void {
        book.borrowedCount = 0;
        book.borrowedBy = [];
        book.borrowedRecords = [];
        this.books.push(book);
        this.saveToFile();
    }

    list(): Book[] {
        return this.books;
    }

    addUser(user: User): void {
        this.users.push(user);
        this.saveUsersToFile();
    }

    listUsers(): User[] {
        return this.users;
    }

    getUserById(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }

    countUserBorrowedBooks(userId: number): number {
        return this.books.reduce((count, b) =>
            b.borrowedBy && b.borrowedBy.includes(userId) ? count + 1 : count, 0
        );
    }

    borrowBook(id: number, userId: number): boolean | string {
        const book = this.books.find(b => b.id === id);
        const user = this.getUserById(userId);
        if (!book || !user) return false;
        if (book.minAge && user.age < book.minAge) {
            return `User does not meet the minimum age requirement (${book.minAge}+).`;
        }
        if (book.borrowedCount >= book.copies) return false;
        if (book.borrowedBy && book.borrowedBy.includes(userId)) return false;
        if (this.countUserBorrowedBooks(userId) >= MAX_BORROW_PER_USER) {
            return `User has reached the maximum allowed borrowed books (${MAX_BORROW_PER_USER}).`;
        }
        book.borrowedCount += 1;
        if (!book.borrowedBy) book.borrowedBy = [];
        book.borrowedBy.push(userId);
        if (!book.borrowedRecords) book.borrowedRecords = [];
        book.borrowedRecords.push({
            userId,
            borrowedAt: new Date().toISOString()
        });
        this.saveToFile();
        return true;
    }

    returnBook(id: number, userId: number): boolean {
        const book = this.books.find(b => b.id === id);
        if (
            book &&
            book.borrowedBy &&
            book.borrowedBy.includes(userId)
        ) {
            book.borrowedCount -= 1;
            book.borrowedBy = book.borrowedBy.filter(uid => uid !== userId);
            if (book.borrowedRecords) {
                for (let i = book.borrowedRecords.length - 1; i >= 0; i--) {
                    const rec = book.borrowedRecords[i];
                    if (rec.userId === userId && !rec.returnedAt) {
                        rec.returnedAt = new Date().toISOString();
                        break;
                    }
                }
            }
            this.saveToFile();
            return true;
        }
        return false;
    }
}
