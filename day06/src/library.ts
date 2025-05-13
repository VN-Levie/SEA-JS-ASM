import { Book, BookStatus } from './book';
import { User as UserClass } from './user';
import { isPositiveInteger, isNonEmptyString, parseIntSafe, readJSON, loadFromApi, saveToApi, saveToFile } from './utils';
import { DATA_PATH, USER_PATH, BOOKS_API_URL, USERS_API_URL, BOOKS_SOURCE_TYPE, USERS_SOURCE_TYPE } from './config';
import { DataSourceType } from './dataSourceType';

const MAX_BORROW_PER_USER = 3;

export class Library {
    private books: Book[] = [];
    private users: UserClass[] = [];

    public constructor() {
        this.loadBookData(BOOKS_SOURCE_TYPE, BOOKS_API_URL);
        this.loadUserData(USERS_SOURCE_TYPE, USERS_API_URL);
    }

    public async loadBookData(sourceType: DataSourceType = DataSourceType.JSON, apiUrl?: string): Promise<void> {
        try {
            let arr: any;
            if (sourceType === DataSourceType.RESTFUL && apiUrl) {
                arr = await loadFromApi(apiUrl);
            } else {
                arr = readJSON(DATA_PATH);
            }
            if (arr && Array.isArray(arr)) {
                this.books = arr.filter((b: any) => isPositiveInteger(String(b.id)))
                    .map((b: any) => ({
                        id: b.id,
                        title: typeof b.title === 'string' ? b.title : '',
                        author: typeof b.author === 'string' ? b.author : '',
                        copies: isPositiveInteger(String(b.copies)) ? b.copies : 1,
                        borrowedCount: typeof b.borrowedCount === 'number' && b.borrowedCount >= 0 ? b.borrowedCount : 0,
                        borrowedBy: Array.isArray(b.borrowedBy) ? b.borrowedBy.filter((uid: any) => isPositiveInteger(String(uid))) : [],
                        borrowedRecords: Array.isArray(b.borrowedRecords) ? b.borrowedRecords : [],
                        minAge: isPositiveInteger(String(b.minAge)) ? b.minAge : 3
                    }));
            } else {
                this.books = [];
            }
        } catch (err) {
            this.books = [];
        }
    }

    private async saveBooks(): Promise<void> {
        if (BOOKS_SOURCE_TYPE === DataSourceType.RESTFUL && BOOKS_API_URL) {
            await saveToApi(BOOKS_API_URL, this.books);
        } else {
            await saveToFile(DATA_PATH, this.books);
        }
    }

    public async loadUserData(sourceType: DataSourceType = DataSourceType.JSON, apiUrl?: string): Promise<void> {
        let arr: any;
        if (sourceType === DataSourceType.RESTFUL && apiUrl) {
            arr = await loadFromApi(apiUrl);
        } else {
            arr = readJSON(USER_PATH);
        }
        if (arr && Array.isArray(arr)) {
            this.users = arr.filter((u: any) => isPositiveInteger(String(u.id)))
                .map((u: any) => new UserClass(
                    u.id,
                    typeof u.name === 'string' ? u.name : 'Unknown',
                    isPositiveInteger(String(u.age)) ? u.age : 18
                ));
        } else {
            this.users = [];
        }
    }

    private async saveUsers(): Promise<void> {
        if (USERS_SOURCE_TYPE === DataSourceType.RESTFUL && USERS_API_URL) {
            await saveToApi(USERS_API_URL, this.users.map(user => user.toJSON()));
        } else {
            await saveToFile(USER_PATH, this.users.map(user => user.toJSON()));
        }
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
        return user.countBorrowedBooks(this.books);
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

    public async saveAll(): Promise<void> {
        await this.saveBooks();
        await this.saveUsers();
    }
}
