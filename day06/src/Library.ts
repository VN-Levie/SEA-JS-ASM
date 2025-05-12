import { Book, BookStatus } from './Book';
import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(__dirname, '..', 'books.json');
const USER_PATH = path.join(__dirname, '..', 'users.json');

export interface User {
    readonly id: number;
    name: string;
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
        // Khởi tạo borrowedCount và borrowedBy nếu chưa có
        book.borrowedCount = 0;
        book.borrowedBy = [];
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

    borrowBook(id: number, userId: number): boolean {
        const book = this.books.find(b => b.id === id);
        const user = this.getUserById(userId);
        if (
            book &&
            user &&
            book.borrowedCount < book.copies &&
            !(book.borrowedBy && book.borrowedBy.includes(userId))
        ) {
            book.borrowedCount += 1;
            if (!book.borrowedBy) book.borrowedBy = [];
            book.borrowedBy.push(userId);
            this.saveToFile();
            return true;
        }
        return false;
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
            this.saveToFile();
            return true;
        }
        return false;
    }
}
