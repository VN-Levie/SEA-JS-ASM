"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Library = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DATA_PATH = path.join(__dirname, '..', 'books.json');
const USER_PATH = path.join(__dirname, '..', 'users.json');
const MAX_BORROW_PER_USER = 3;
class Library {
    constructor() {
        this.books = [];
        this.users = [];
        this.loadFromFile();
        this.loadUsersFromFile();
    }
    loadFromFile() {
        if (fs.existsSync(DATA_PATH)) {
            const raw = fs.readFileSync(DATA_PATH, 'utf-8');
            this.books = JSON.parse(raw);
        }
        else {
            this.books = [];
        }
    }
    saveToFile() {
        fs.writeFileSync(DATA_PATH, JSON.stringify(this.books, null, 2), 'utf-8');
    }
    loadUsersFromFile() {
        if (fs.existsSync(USER_PATH)) {
            const raw = fs.readFileSync(USER_PATH, 'utf-8');
            this.users = JSON.parse(raw);
        }
        else {
            this.users = [];
        }
    }
    saveUsersToFile() {
        fs.writeFileSync(USER_PATH, JSON.stringify(this.users, null, 2), 'utf-8');
    }
    addBook(book) {
        book.borrowedCount = 0;
        book.borrowedBy = [];
        book.borrowedRecords = [];
        this.books.push(book);
        this.saveToFile();
    }
    list() {
        return this.books;
    }
    addUser(user) {
        this.users.push(user);
        this.saveUsersToFile();
    }
    listUsers() {
        return this.users;
    }
    getUserById(id) {
        return this.users.find(u => u.id === id);
    }
    countUserBorrowedBooks(userId) {
        return this.books.reduce((count, b) => b.borrowedBy && b.borrowedBy.includes(userId) ? count + 1 : count, 0);
    }
    updateBook(id, data) {
        const idx = this.books.findIndex(b => b.id === id);
        if (idx !== -1) {
            this.books[idx] = Object.assign(Object.assign({}, this.books[idx]), data);
            this.saveToFile();
        }
    }
    borrowBook(id, userId) {
        const book = this.books.find(b => b.id === id);
        const user = this.getUserById(userId);
        if (!book || !user)
            return false;
        if (book.minAge && user.age < book.minAge) {
            return `User does not meet the minimum age requirement (${book.minAge}+).`;
        }
        if (book.borrowedCount >= book.copies)
            return false;
        if (book.borrowedBy && book.borrowedBy.includes(userId))
            return false;
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
    returnBook(id, userId) {
        const book = this.books.find(b => b.id === id);
        if (book &&
            book.borrowedBy &&
            book.borrowedBy.includes(userId)) {
            const newBorrowedBy = book.borrowedBy.filter(uid => uid !== userId);
            let newBorrowedRecords = book.borrowedRecords ? [...book.borrowedRecords] : [];
            for (let i = newBorrowedRecords.length - 1; i >= 0; i--) {
                const rec = newBorrowedRecords[i];
                if (rec.userId === userId && !rec.returnedAt) {
                    newBorrowedRecords[i] = Object.assign(Object.assign({}, rec), { returnedAt: new Date().toISOString() });
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
}
exports.Library = Library;
