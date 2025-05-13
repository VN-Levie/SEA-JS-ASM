import { BorrowRecord } from './borrowRecord';

export interface BookData {
    readonly id: number;
    title: string;
    author: string;
    copies: number;
    borrowedCount?: number;
    borrowedBy?: number[];
    borrowedRecords?: BorrowRecord[];
    minAge?: number;
    genre?: string;
}