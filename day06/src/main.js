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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Library_1 = require("./Library");
const readline = __importStar(require("readline"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const lib = new Library_1.Library();
function showMenu() {
    console.log('\n=== Library Menu ===');
    console.log('1. List books');
    console.log('2. Add book');
    console.log('3. Borrow book');
    console.log('4. Return book');
    console.log('5. List users');
    console.log('6. Add user');
    console.log('7. Search books');
    console.log('8. List borrowed books');
    console.log('9. Check user debts');
    console.log('0. Exit');
}
function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}
function listBooks(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const books = lib.list();
        books.forEach(b => {
            const available = b.copies - b.borrowedCount;
            let userInfo = '';
            if (b.borrowedBy && b.borrowedBy.length > 0) {
                userInfo = ' (Borrowed by: ' + b.borrowedBy.map(uid => {
                    const user = lib.getUserById(uid);
                    return user ? user.name : `User#${uid}`;
                }).join(', ') + ')';
            }
            console.log(`#${b.id} - ${b.title} by ${b.author} [${available}/${b.copies} available]${userInfo}`);
        });
        callback();
    });
}
function addBook(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = parseInt(yield prompt('Enter book ID: '));
        const title = yield prompt('Enter book title: ');
        const author = yield prompt('Enter author: ');
        const copies = parseInt(yield prompt('Enter number of copies: '));
        lib.addBook({ id, title, author, copies, borrowedCount: 0, borrowedBy: [] });
        console.log('Book added.');
        callback();
    });
}
function borrowBook(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const bid = parseInt(yield prompt('Enter book ID to borrow: '));
        const borrowerId = parseInt(yield prompt('Enter your user ID: '));
        const result = lib.borrowBook(bid, borrowerId);
        if (result === true) {
            console.log('Book borrowed.');
        }
        else if (typeof result === 'string') {
            console.log('Cannot borrow this book:', result);
        }
        else {
            console.log('Cannot borrow this book. Make sure the book is available, you have not borrowed it yet, and user exists.');
        }
        callback();
    });
}
function returnBook(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const returnerIdInput = yield prompt('Enter your user ID (or !q to quit): ');
        if (returnerIdInput.trim() === '!q') {
            callback();
            return;
        }
        const returnerId = parseInt(returnerIdInput);
        const user = lib.getUserById(returnerId);
        if (!user) {
            console.log('User not found.');
            callback();
            return;
        }
        // Liệt kê sách user đang mượn
        const borrowedBooks = lib.list().filter(b => b.borrowedBy && b.borrowedBy.includes(returnerId));
        if (borrowedBooks.length === 0) {
            console.log('You have not borrowed any books.');
            callback();
            return;
        }
        console.log('Books you are currently borrowing:');
        borrowedBooks.forEach(b => {
            let time = '';
            if (b.borrowedRecords) {
                const rec = [...b.borrowedRecords].reverse().find(r => r.userId === returnerId && !r.returnedAt);
                if (rec)
                    time = ` (borrowed at ${rec.borrowedAt})`;
            }
            console.log(`#${b.id} - ${b.title} by ${b.author}${time}`);
        });
        const ridInput = yield prompt('Enter book ID to return (or !q to quit): ');
        if (ridInput.trim() === '!q') {
            callback();
            return;
        }
        const rid = parseInt(ridInput);
        if (lib.returnBook(rid, returnerId)) {
            console.log('Book returned.');
        }
        else {
            console.log('Cannot return this book. Make sure you have borrowed it.');
        }
        callback();
    });
}
function listUsers(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = lib.listUsers();
        users.forEach(u => {
            console.log(`#${u.id} - ${u.name}`);
        });
        callback();
    });
}
function addUser(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = parseInt(yield prompt('Enter user ID: '));
        const name = yield prompt('Enter user name: ');
        lib.addUser({ id: userId, name });
        console.log('User added.');
        callback();
    });
}
function searchBooks(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const keyword = (yield prompt('Enter keyword to search (title/author, !q to quit): ')).toLowerCase();
            if (keyword.trim() === '!q') {
                break;
            }
            if (keyword.trim() === '') {
                console.log('Keyword cannot be empty.');
                continue;
            }
            const books = lib.list().filter(b => b.title.toLowerCase().includes(keyword) ||
                b.author.toLowerCase().includes(keyword));
            if (books.length === 0) {
                console.log('No books found.');
            }
            else {
                books.forEach(b => {
                    const available = b.copies - b.borrowedCount;
                    let userInfo = '';
                    if (b.borrowedBy && b.borrowedBy.length > 0) {
                        userInfo = ' (Borrowed by: ' + b.borrowedBy.map(uid => {
                            const user = lib.getUserById(uid);
                            return user ? user.name : `User#${uid}`;
                        }).join(', ') + ')';
                    }
                    console.log(`#${b.id} - ${b.title} by ${b.author} [${available}/${b.copies} available]${userInfo}`);
                });
            }
        }
        callback();
    });
}
function listBorrowedBooks(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.length > 0);
        if (books.length === 0) {
            console.log('No books are currently borrowed.');
        }
        else {
            books.forEach(b => {
                let userInfo = '';
                if (b.borrowedBy && b.borrowedBy.length > 0) {
                    userInfo = ' (Borrowed by: ' + b.borrowedBy.map(uid => {
                        const user = lib.getUserById(uid);
                        let time = '';
                        if (b.borrowedRecords) {
                            const rec = [...b.borrowedRecords].reverse().find(r => r.userId === uid && !r.returnedAt);
                            if (rec)
                                time = ` at ${rec.borrowedAt}`;
                        }
                        return user ? `${user.name}${time}` : `User#${uid}${time}`;
                    }).join(', ') + ')';
                }
                const available = b.copies - b.borrowedCount;
                console.log(`#${b.id} - ${b.title} by ${b.author} [${available}/${b.copies} available]${userInfo}`);
            });
        }
        callback();
    });
}
function checkUserDebts(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = parseInt(yield prompt('Enter user ID to check: '));
        const user = lib.getUserById(userId);
        if (!user) {
            console.log('User not found.');
            callback();
            return;
        }
        const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.includes(userId));
        if (books.length === 0) {
            console.log(`${user.name} does not have any borrowed books.`);
        }
        else {
            console.log(`${user.name} is currently borrowing:`);
            books.forEach(b => {
                let time = '';
                if (b.borrowedRecords) {
                    const rec = [...b.borrowedRecords].reverse().find(r => r.userId === userId && !r.returnedAt);
                    if (rec)
                        time = ` (borrowed at ${rec.borrowedAt})`;
                }
                console.log(`#${b.id} - ${b.title} by ${b.author}${time}`);
            });
        }
        callback();
    });
}
function mainMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        showMenu();
        const choice = yield prompt('Choose an option: ');
        switch (choice.trim()) {
            case '1':
                yield listBooks(mainMenu);
                break;
            case '2':
                yield addBook(mainMenu);
                break;
            case '3':
                yield borrowBook(mainMenu);
                break;
            case '4':
                yield returnBook(mainMenu);
                break;
            case '5':
                yield listUsers(mainMenu);
                break;
            case '6':
                yield addUser(mainMenu);
                break;
            case '7':
                yield searchBooks(mainMenu);
                break;
            case '8':
                yield listBorrowedBooks(mainMenu);
                break;
            case '9':
                yield checkUserDebts(mainMenu);
                break;
            case '0':
                rl.close();
                break;
            default:
                console.log('Invalid choice.');
                mainMenu();
        }
    });
}
mainMenu();
