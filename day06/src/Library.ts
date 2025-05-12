import { Book, BookStatus } from './Book';
import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(__dirname, '..', 'books.json');

export class Library {
    private books: Book[] = [];

    constructor() {
        this.loadFromFile();
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

    addBook(book: Book): void {
        this.books.push(book);
        this.saveToFile();
    }

    list(): Book[] {
        return this.books;
    }

    borrowBook(id: number): boolean {
        const book = this.books.find(b => b.id === id);
        if (book && book.status === BookStatus.Available) {
            book.status = BookStatus.Borrowed;
            this.saveToFile();
            return true;
        }
        return false;
    }

    returnBook(id: number): void {
        const book = this.books.find(b => b.id === id);
        if (book && book.status === BookStatus.Borrowed) {
            book.status = BookStatus.Available;
            this.saveToFile();
        }
    }
}
