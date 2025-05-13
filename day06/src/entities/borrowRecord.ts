export interface BorrowRecord {
    userId: number;
    borrowedAt: string;
    returnedAt?: string;
}