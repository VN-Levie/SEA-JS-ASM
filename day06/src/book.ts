export enum BookStatus {
    Available,
    Borrowed,
    Lost
}

export interface BorrowRecord {
    userId: number;
    borrowedAt: string;
    returnedAt?: string;
}

export interface Book {
    readonly id: number;
    title: string;
    author: string;
    copies: number;
    borrowedCount: number;
    borrowedBy?: number[];
    borrowedRecords?: BorrowRecord[];
    minAge?: number;
}
