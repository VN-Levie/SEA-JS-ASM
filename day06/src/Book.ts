export enum BookStatus {
    Available,
    Borrowed,
    Lost
}

export interface Book {
    readonly id: number;
    title: string;
    author: string;
    status: BookStatus;
}
