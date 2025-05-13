import { Book, BookStatus } from './book';
import { User as UserClass } from './user';
import { isPositiveInteger, isNonEmptyString, parseIntSafe } from './utils';
import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(__dirname, '..', 'books.json');
const USER_PATH = path.join(__dirname, '..', 'users.json');
const MAX_BORROW_PER_USER = 3;

export class Library {
    private books: Book[] = [];
    private users: UserClass[] = [];

    public constructor() {
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
            this.users = JSON.parse(raw).map((userData: any) => new UserClass(userData.id, userData.name, userData.age));
        } else {
            this.users = [];
        }
    }

    private saveUsersToFile(): void {
        fs.writeFileSync(USER_PATH, JSON.stringify(this.users.map(user => user.toJSON()), null, 2), 'utf-8');
    }

    public addBook(book: Book): void {
        book.borrowedCount = 0;
        book.borrowedBy = [];
        book.borrowedRecords = [];
        this.books.push(book);
    }

    public list(): Book[] {
        return this.books;
    }

    public addUser(user: UserClass): void {
        this.users.push(user);
    }

    public listUsers(): UserClass[] {
        return this.users;
    }

    public getUserById(id: number): UserClass | undefined {
        return this.users.find(u => u.id === id);
    }

    public countUserBorrowedBooks(userId: number): number {
        const user = this.getUserById(userId);
        if (!user) return 0;
        return user.borrowedBooksCount(this.books);
    }

    public updateBook(id: number, data: Partial<Book>): void {
        const idx = this.books.findIndex(b => b.id === id);
        if (idx !== -1) {
            this.books[idx] = { ...this.books[idx], ...data };          
        }
    }

    public borrowBook(id: number, userId: number): boolean | string {
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
        const newBorrowedBy = book.borrowedBy ? [...book.borrowedBy, userId] : [userId];
        const newBorrowedRecords = book.borrowedRecords ? [...book.borrowedRecords] : [];
        newBorrowedRecords.push({
            userId,
            borrowedAt: new Date().toISOString()
        });
        this.updateBook(id, {
            borrowedCount: book.borrowedCount + 1,
            borrowedBy: newBorrowedBy,
            borrowedRecords: newBorrowedRecords
        });
        return true;
    }

    public returnBook(id: number, userId: number): boolean {
        const book = this.books.find(b => b.id === id);
        if (
            book &&
            book.borrowedBy &&
            book.borrowedBy.includes(userId)
        ) {
            const newBorrowedBy = book.borrowedBy.filter(uid => uid !== userId);
            let newBorrowedRecords = book.borrowedRecords ? [...book.borrowedRecords] : [];
            for (let i = newBorrowedRecords.length - 1; i >= 0; i--) {
                const rec = newBorrowedRecords[i];
                if (rec.userId === userId && !rec.returnedAt) {
                    newBorrowedRecords[i] = { ...rec, returnedAt: new Date().toISOString() };
                    break;
                }
            }
            this.updateBook(id, {
                borrowedCount: book.borrowedCount - 1,
                borrowedBy: newBorrowedBy,
                borrowedRecords: newBorrowedRecords
            });
            return true;
        }
        return false;
    }

    public saveAll(): void {
        this.saveToFile();
        this.saveUsersToFile();
    }
}
