import { Book } from './book';
import { User } from './user';
import { BookData } from '../entities/bookData';
import { readJSON, loadFromApi, saveToApi, saveToFile } from '../commons/utils';
import { DATA_PATH, USER_PATH, BOOKS_API_URL, USERS_API_URL, BOOKS_SOURCE_TYPE, USERS_SOURCE_TYPE } from '../commons/config';
import { DataSourceType } from '../commons/dataSourceType';
import { AppDataType } from '../commons/appDataType';


const MAX_BORROW_PER_USER = 3;

export class Library {
    private books: Book[] = [];
    private users: User[] = [];

    public constructor() {
    }

    private isRestfulSource(type: AppDataType): boolean {
        if (type === AppDataType.BOOK) {
            return BOOKS_SOURCE_TYPE === DataSourceType.RESTFUL && !!BOOKS_API_URL;
        }
        if (type === AppDataType.USER) {
            return USERS_SOURCE_TYPE === DataSourceType.RESTFUL && !!USERS_API_URL;
        }
        return false;
    }

    public async loadAppData(): Promise<void> {
        await this.loadBookData();
        await this.loadUserData();
    }
 
    private async loadData(type: AppDataType): Promise<any[]> {
        let arr: any;
        switch (type) {
            case AppDataType.BOOK:
                if (this.isRestfulSource(AppDataType.BOOK)) {
                    arr = await loadFromApi(BOOKS_API_URL);
                } else {                    
                    arr = readJSON(DATA_PATH);
                }
                break;
            case AppDataType.USER:
                if (this.isRestfulSource(AppDataType.USER)) {
                    arr = await loadFromApi(USERS_API_URL);
                } else {
                    arr = readJSON(USER_PATH);
                }
                break;
            default:
                arr = [];
        }
        return Array.isArray(arr) ? arr : [];
    }

    
    public async loadBookData(): Promise<void> {
        const rawBooksData = await this.loadData(AppDataType.BOOK);
        this.books = [];
        for (const b of rawBooksData) {
            try {
                if (b && typeof b.id === 'number') {
                     const book = new Book(
                        b.id,
                        typeof b.title === 'string' ? b.title : 'Unknown Title',
                        typeof b.author === 'string' ? b.author : 'Unknown Author',
                        typeof b.copies === 'number' && b.copies >= 0 ? b.copies : 1,
                        typeof b.minAge === 'number' && b.minAge > 0 ? b.minAge : undefined,
                        typeof b.borrowedCount === 'number' && b.borrowedCount >=0 ? b.borrowedCount : 0,
                        Array.isArray(b.borrowedBy) ? b.borrowedBy.filter((uid: any) => typeof uid === 'number') : [],
                        Array.isArray(b.borrowedRecords) ? b.borrowedRecords.filter((rec: any) => rec && typeof rec.userId === 'number' && typeof rec.borrowedAt === 'string') : []
                    );
                    this.books.push(book);
                }
            } catch (error) {
                console.error(`Error loading book with data ${JSON.stringify(b)}:`, error instanceof Error ? error.message : String(error));
            }
        }
    }

    
    public async loadUserData(): Promise<void> {
        const rawUsersData = await this.loadData(AppDataType.USER);
        this.users = [];
        for (const u of rawUsersData) {
            try {
                if (u && typeof u.id === 'number') {
                    const user = new User(
                        u.id,
                        typeof u.name === 'string' ? u.name : 'Unknown User',
                        typeof u.age === 'number' && u.age > 0 ? u.age : 18
                    );
                    this.users.push(user);
                }
            } catch (error) {
                 console.error(`Error loading user with data ${JSON.stringify(u)}:`, error instanceof Error ? error.message : String(error));
            }
        }
    }

    private async saveBooks(): Promise<void> {
        const booksToSave = this.books.map(book => book.toJSON());
        if (this.isRestfulSource(AppDataType.BOOK)) {
            await saveToApi(BOOKS_API_URL, booksToSave);
        } else {
            await saveToFile(DATA_PATH, booksToSave);
        }
    }

    private async saveUsers(): Promise<void> {
        const usersToSave = this.users.map(user => user.toJSON());
        if (this.isRestfulSource(AppDataType.USER)) {
            await saveToApi(USERS_API_URL, usersToSave);
        } else {
            await saveToFile(USER_PATH, usersToSave);
        }
    }

    public addBook(bookData: BookData): Book | string {
        if (this.books.some(b => b.id === bookData.id)) {
            return "Book with this ID already exists.";
        }
        if (this.books.some(b => b.title.toLowerCase() === bookData.title.toLowerCase() && b.author.toLowerCase() === bookData.author.toLowerCase())) {
            return "Book with the same title and author already exists.";
        }
        try {
            const newBook = new Book(
                bookData.id,
                bookData.title,
                bookData.author,
                bookData.copies,
                bookData.minAge,
                0, 
                [],
                [] 
            );
            this.books.push(newBook);
            return newBook;
        } catch (error) {
            return error instanceof Error ? error.message : "Failed to add book due to invalid data.";
        }
    }

    public listBooks(): Book[] {
        return [...this.books];
    }
    
    public findBookById(id: number): Book | undefined {
        return this.books.find(b => b.id === id);
    }

    public addUser(id: number, name: string, age: number): User | string {
        if (this.users.some(u => u.id === id)) {
            return "User with this ID already exists.";
        }
        try {
            const newUser = new User(id, name, age);
            this.users.push(newUser);
            return newUser;
        } catch (error) {
            return error instanceof Error ? error.message : "Failed to add user due to invalid data.";
        }
    }

    public listUsers(): User[] {
        return [...this.users];
    }

    public getUserById(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }

    public countUserBorrowedBooks(userId: number): number {
        const user = this.getUserById(userId);
        if (!user) return 0;
        return user.countBorrowedBooks(this.books);
    }

    public updateBook(id: number, data: { title?: string; author?: string; copies?: number; minAge?: number | null }): string | true {
        const book = this.findBookById(id);
        if (!book) {
            return "Book not found.";
        }
        const result = book.updateDetails(data);
        if (result !== true) {
            return result;
        }
        return true;
    }

    public borrowBook(bookId: number, userId: number): string | true {
        const book = this.findBookById(bookId);
        const user = this.getUserById(userId);

        if (!book) return "Book not found.";
        if (!user) return "User not found.";

        if (!book.canBeBorrowedByAge(user.age)) {
            return `User (age ${user.age}) does not meet the minimum age requirement (${book.minAge ? book.minAge + '+' : 'N/A'}).`;
        }
        
        if (this.countUserBorrowedBooks(userId) >= MAX_BORROW_PER_USER) {
            return `User has reached the maximum allowed borrowed books (${MAX_BORROW_PER_USER}).`;
        }
        
        const borrowResult = book.addBorrower(userId);
        if (borrowResult !== true) {
            return borrowResult; 
        }
        return true;
    }

    public returnBook(bookId: number, userId: number): string | true {
        const book = this.findBookById(bookId);
        const user = this.getUserById(userId);

        if (!book) return "Book not found.";
        if (!user) return "User not found.";
        
        const returnResult = book.removeBorrower(userId);
        if (returnResult !== true) {
            return returnResult;
        }
        return true;
    }

    public async saveAll(): Promise<void> {
        await this.saveBooks();
        await this.saveUsers();
    }
}