import { isPositiveInteger, isNonEmptyString } from '../commons/utils';
import { BorrowRecord } from '../entities/borrowRecord';

export class Book {
    public readonly id: number;
    public title: string;
    public author: string;
    public copies: number;
    public borrowedCount: number;
    public borrowedBy: number[];
    public borrowedRecords: BorrowRecord[];
    public minAge?: number;
    public genre?: string;

    constructor(id: number, title: string, author: string, copies: number, minAge?: number, borrowedCount: number = 0, borrowedBy: number[] = [], borrowedRecords: BorrowRecord[] = [], genre?: string) {
        if (!isPositiveInteger(String(id))) {
            throw new Error('Book ID must be a positive integer.');
        }
        if (!isNonEmptyString(title)) {
            throw new Error('Book title cannot be empty.');
        }
        if (!isNonEmptyString(author)) {
            throw new Error('Book author cannot be empty.');
        }
        if (!(Number.isInteger(copies) && copies >= 0)) {
            throw new Error('Book copies must be a non-negative integer.');
        }
        if (minAge !== undefined && (!isPositiveInteger(String(minAge)) || minAge <= 0)) {
            throw new Error('Minimum age must be a positive integer if specified.');
        }
        if (borrowedCount < 0) {
            throw new Error('Borrowed count cannot be negative.');
        }
        if (copies < borrowedCount) {
            throw new Error('Copies cannot be less than borrowed count.');
        }
        if (genre !== undefined && !isNonEmptyString(genre)) {
            throw new Error('Genre must be a non-empty string if specified.');
        }

        this.id = id;
        this.title = title;
        this.author = author;
        this.copies = copies;
        this.minAge = minAge;
        this.borrowedCount = borrowedCount;
        this.borrowedBy = [...borrowedBy];
        this.borrowedRecords = [...borrowedRecords].map(r => ({...r}));
        this.genre = genre;
    }

    public getAvailableCopies(): number {
        return this.copies - this.borrowedCount;
    }

    public isAvailable(): boolean {
        return this.getAvailableCopies() > 0;
    }

    public isBorrowedByUser(userId: number): boolean {
        return this.borrowedBy.includes(userId);
    }

    public canBeBorrowedByAge(userAge: number): boolean {
        return !(this.minAge && userAge < this.minAge);
    }

    public addBorrower(userId: number): string | true {
        if (!this.isAvailable()) {
            return "Book is not available for borrowing.";
        }
        if (this.isBorrowedByUser(userId)) {
            return "User has already borrowed this book.";
        }
        this.borrowedBy.push(userId);
        this.borrowedCount++;
        this.addBorrowRecord(userId);
        return true;
    }

    public removeBorrower(userId: number): string | true {
        const userIndex = this.borrowedBy.indexOf(userId);
        if (userIndex === -1) {
            return "User has not borrowed this book.";
        }
        this.borrowedBy.splice(userIndex, 1);
        this.borrowedCount--;
        this.updateReturnRecord(userId);
        return true;
    }

    private addBorrowRecord(userId: number): void {
        this.borrowedRecords.push({
            userId,
            borrowedAt: new Date().toISOString(),
        });
    }

    private updateReturnRecord(userId: number): void {
        for (let i = this.borrowedRecords.length - 1; i >= 0; i--) {
            const record = this.borrowedRecords[i];
            if (record.userId === userId && !record.returnedAt) {
                record.returnedAt = new Date().toISOString();
                break;
            }
        }
    }
    
    public updateDetails(data: { title?: string; author?: string; copies?: number; minAge?: number | null; genre?: string | null }): string | true {
        if (data.title !== undefined) {
            if (!isNonEmptyString(data.title)) return "Title cannot be empty.";
            this.title = data.title;
        }
        if (data.author !== undefined) {
            if (!isNonEmptyString(data.author)) return "Author cannot be empty.";
            this.author = data.author;
        }
        if (data.copies !== undefined) {
            if (!(Number.isInteger(data.copies) && data.copies >= 0)) return "Copies must be a non-negative integer.";
            if (data.copies < this.borrowedCount) return "Copies cannot be less than currently borrowed count.";
            this.copies = data.copies;
        }
        if (data.minAge !== undefined) {
            if (data.minAge === null) {
                this.minAge = undefined;
            } else {
                if (!isPositiveInteger(String(data.minAge)) || data.minAge <= 0) return "Minimum age must be a positive integer.";
                this.minAge = data.minAge;
            }
        }
        if (data.genre !== undefined) {
            if (data.genre === null) {
                this.genre = undefined;
            } else {
                if (!isNonEmptyString(data.genre)) return "Genre must be a non-empty string.";
                this.genre = data.genre;
            }
        }
        return true;
    }

    public toJSON(): any {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            copies: this.copies,
            borrowedCount: this.borrowedCount,
            borrowedBy: [...this.borrowedBy],
            borrowedRecords: [...this.borrowedRecords].map(r => ({...r})),
            minAge: this.minAge,
            genre: this.genre,
        };
    }
}