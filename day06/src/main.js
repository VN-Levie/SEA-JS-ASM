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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Library_1 = require("./Library");
const readline = __importStar(require("readline"));
const cli_table3_1 = __importDefault(require("cli-table3"));
const chalk_1 = __importDefault(require("chalk"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const lib = new Library_1.Library();
function showMenu() {
    console.log(chalk_1.default.greenBright('\n==============================='));
    console.log(chalk_1.default.bold.bgBlueBright('        📚 LIBRARY MENU 📚      '));
    console.log(chalk_1.default.greenBright('==============================='));
    console.log(chalk_1.default.yellowBright('1.') + ' List books');
    console.log(chalk_1.default.yellowBright('2.') + ' Add book');
    console.log(chalk_1.default.yellowBright('3.') + ' Borrow book');
    console.log(chalk_1.default.yellowBright('4.') + ' Return book');
    console.log(chalk_1.default.yellowBright('5.') + ' List users');
    console.log(chalk_1.default.yellowBright('6.') + ' Add user');
    console.log(chalk_1.default.yellowBright('7.') + ' Search books');
    console.log(chalk_1.default.yellowBright('8.') + ' List borrowed books');
    console.log(chalk_1.default.yellowBright('9.') + ' Check user debts');
    console.log(chalk_1.default.yellowBright('0.') + ' Exit');
    console.log(chalk_1.default.greenBright('==============================='));
}
function prompt(question) {
    return new Promise(resolve => rl.question(question, resolve));
}
function listBooks(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const books = lib.list();
        const table = new cli_table3_1.default({
            head: [chalk_1.default.cyanBright('ID'), chalk_1.default.cyanBright('Title'), chalk_1.default.cyanBright('Author'), chalk_1.default.cyanBright('Available'), chalk_1.default.cyanBright('Total'), chalk_1.default.cyanBright('Borrowed By')],
            colWidths: [5, 30, 20, 10, 8, 30]
        });
        books.forEach(b => {
            const available = b.copies - b.borrowedCount;
            let userInfo = '';
            if (b.borrowedBy && b.borrowedBy.length > 0) {
                userInfo = b.borrowedBy.map(uid => {
                    const user = lib.getUserById(uid);
                    return user ? user.name : `User#${uid}`;
                }).join(', ');
            }
            let title = b.title;
            if (b.minAge)
                title += ` (${b.minAge}+)`;
            table.push([
                b.id,
                title,
                b.author,
                available,
                b.copies,
                userInfo
            ]);
        });
        console.log(table.toString());
        console.log(chalk_1.default.greenBright('---------------------------------'));
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
        console.log(chalk_1.default.greenBright('✔ Book added.'));
        callback();
    });
}
function borrowBook(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const bid = parseInt(yield prompt('Enter book ID to borrow: '));
        const borrowerId = parseInt(yield prompt('Enter your user ID: '));
        const result = lib.borrowBook(bid, borrowerId);
        if (result === true) {
            console.log(chalk_1.default.greenBright('✔ Book borrowed.'));
        }
        else if (typeof result === 'string') {
            console.log(chalk_1.default.redBright('✖ Cannot borrow this book:'), chalk_1.default.yellow(result));
        }
        else {
            console.log(chalk_1.default.redBright('✖ Cannot borrow this book. Make sure the book is available, you have not borrowed it yet, and user exists.'));
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
            console.log(chalk_1.default.redBright('✖ User not found.'));
            callback();
            return;
        }
        const borrowedBooks = lib.list().filter(b => b.borrowedBy && b.borrowedBy.includes(returnerId));
        if (borrowedBooks.length === 0) {
            console.log(chalk_1.default.yellowBright('You have not borrowed any books.'));
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
            console.log(chalk_1.default.greenBright('✔ Book returned.'));
        }
        else {
            console.log(chalk_1.default.redBright('✖ Cannot return this book. Make sure you have borrowed it.'));
        }
        callback();
    });
}
function listUsers(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const users = lib.listUsers();
        const table = new cli_table3_1.default({
            head: [chalk_1.default.cyanBright('ID'), chalk_1.default.cyanBright('Name'), chalk_1.default.cyanBright('Age')],
            colWidths: [5, 30, 8]
        });
        users.forEach(u => {
            table.push([u.id, u.name, u.age]);
        });
        console.log(table.toString());
        console.log(chalk_1.default.greenBright('---------------------------------'));
        callback();
    });
}
function addUser(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = parseInt(yield prompt('Enter user ID: '));
        const name = yield prompt('Enter user name: ');
        const age = parseInt(yield prompt('Enter user age: '));
        lib.addUser({ id: userId, name, age });
        console.log(chalk_1.default.greenBright('✔ User added.'));
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
                console.log(chalk_1.default.yellowBright('No books found.'));
            }
            else {
                const table = new cli_table3_1.default({
                    head: [chalk_1.default.cyanBright('ID'), chalk_1.default.cyanBright('Title'), chalk_1.default.cyanBright('Author'), chalk_1.default.cyanBright('Available'), chalk_1.default.cyanBright('Total'), chalk_1.default.cyanBright('Borrowed By')],
                    colWidths: [5, 30, 20, 10, 8, 30]
                });
                books.forEach(b => {
                    const available = b.copies - b.borrowedCount;
                    let userInfo = '';
                    if (b.borrowedBy && b.borrowedBy.length > 0) {
                        userInfo = b.borrowedBy.map(uid => {
                            const user = lib.getUserById(uid);
                            return user ? user.name : `User#${uid}`;
                        }).join(', ');
                    }
                    let title = b.title;
                    if (b.minAge)
                        title += ` (${b.minAge}+)`;
                    table.push([
                        b.id,
                        title,
                        b.author,
                        available,
                        b.copies,
                        userInfo
                    ]);
                });
                console.log(table.toString());
                console.log(chalk_1.default.greenBright('---------------------------------'));
            }
        }
        callback();
    });
}
function listBorrowedBooks(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.length > 0);
        if (books.length === 0) {
            console.log(chalk_1.default.yellowBright('No books are currently borrowed.'));
        }
        else {
            const table = new cli_table3_1.default({
                head: [chalk_1.default.cyanBright('ID'), chalk_1.default.cyanBright('Title'), chalk_1.default.cyanBright('Author'), chalk_1.default.cyanBright('Available'), chalk_1.default.cyanBright('Total'), chalk_1.default.cyanBright('Borrowed By')],
                colWidths: [5, 30, 20, 10, 8, 30]
            });
            books.forEach(b => {
                let userInfo = '';
                if (b.borrowedBy && b.borrowedBy.length > 0) {
                    userInfo = b.borrowedBy.map(uid => {
                        const user = lib.getUserById(uid);
                        let time = '';
                        if (b.borrowedRecords) {
                            const rec = [...b.borrowedRecords].reverse().find(r => r.userId === uid && !r.returnedAt);
                            if (rec)
                                time = ` at ${rec.borrowedAt}`;
                        }
                        return user ? `${user.name}${time}` : `User#${uid}${time}`;
                    }).join(', ');
                }
                const available = b.copies - b.borrowedCount;
                let title = b.title;
                if (b.minAge)
                    title += ` (${b.minAge}+)`;
                table.push([
                    b.id,
                    title,
                    b.author,
                    available,
                    b.copies,
                    userInfo
                ]);
            });
            console.log(table.toString());
            console.log(chalk_1.default.greenBright('---------------------------------'));
        }
        callback();
    });
}
function checkUserDebts(callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = parseInt(yield prompt('Enter user ID to check: '));
        const user = lib.getUserById(userId);
        if (!user) {
            console.log(chalk_1.default.redBright('✖ User not found.'));
            callback();
            return;
        }
        const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.includes(userId));
        if (books.length === 0) {
            console.log(chalk_1.default.greenBright(`${user.name} does not have any borrowed books.`));
        }
        else {
            console.log(chalk_1.default.yellowBright(`${user.name} is currently borrowing:`));
            const table = new cli_table3_1.default({
                head: [chalk_1.default.cyanBright('ID'), chalk_1.default.cyanBright('Title'), chalk_1.default.cyanBright('Author'), chalk_1.default.cyanBright('Borrowed At')],
                colWidths: [5, 30, 20, 25]
            });
            books.forEach(b => {
                let borrowedAt = '';
                if (b.borrowedRecords) {
                    const rec = [...b.borrowedRecords].reverse().find(r => r.userId === userId && !r.returnedAt);
                    if (rec)
                        borrowedAt = rec.borrowedAt;
                }
                table.push([
                    b.id,
                    b.title,
                    b.author,
                    borrowedAt
                ]);
            });
            console.log(table.toString());
            console.log(chalk_1.default.greenBright('---------------------------------'));
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
