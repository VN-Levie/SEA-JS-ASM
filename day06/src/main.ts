import { Library, User } from './Library';
import { BookStatus, Book } from './Book';
import * as readline from 'readline';
import Table from 'cli-table3';
import chalk from 'chalk';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lib = new Library();

function showMenu() {
    console.log(chalk.greenBright('\n==============================='));
    console.log(chalk.bold.bgBlueBright('        📚 LIBRARY MENU 📚      '));
    console.log(chalk.greenBright('==============================='));
    console.log(chalk.yellowBright('1.') + ' List books');
    console.log(chalk.yellowBright('2.') + ' Add book');
    console.log(chalk.yellowBright('3.') + ' Borrow book');
    console.log(chalk.yellowBright('4.') + ' Return book');
    console.log(chalk.yellowBright('5.') + ' List users');
    console.log(chalk.yellowBright('6.') + ' Add user');
    console.log(chalk.yellowBright('7.') + ' Search books');
    console.log(chalk.yellowBright('8.') + ' List borrowed books');
    console.log(chalk.yellowBright('9.') + ' Check user debts');
    console.log(chalk.yellowBright('0.') + ' Exit');
    console.log(chalk.greenBright('==============================='));
}

function prompt(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

async function listBooks(callback: () => void) {
    const books = lib.list();
    const table = new Table({
        head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Available'), chalk.cyanBright('Total'), chalk.cyanBright('Borrowed By')],
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
        if (b.minAge) title += ` (${b.minAge}+)`;
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
    console.log(chalk.greenBright('---------------------------------'));
    callback();
}

async function addBook(callback: () => void) {
    const id = parseInt(await prompt('Enter book ID: '));
    const title = await prompt('Enter book title: ');
    const author = await prompt('Enter author: ');
    const copies = parseInt(await prompt('Enter number of copies: '));
    lib.addBook({ id, title, author, copies, borrowedCount: 0, borrowedBy: [] });
    console.log(chalk.greenBright('✔ Book added.'));
    callback();
}

async function borrowBook(callback: () => void) {
    const bid = parseInt(await prompt('Enter book ID to borrow: '));
    const borrowerId = parseInt(await prompt('Enter your user ID: '));
    const result = lib.borrowBook(bid, borrowerId);
    if (result === true) {
        console.log(chalk.greenBright('✔ Book borrowed.'));
    } else if (typeof result === 'string') {
        console.log(chalk.redBright('✖ Cannot borrow this book:'), chalk.yellow(result));
    } else {
        console.log(chalk.redBright('✖ Cannot borrow this book. Make sure the book is available, you have not borrowed it yet, and user exists.'));
    }
    callback();
}

async function returnBook(callback: () => void) {
    const returnerIdInput = await prompt('Enter your user ID (or !q to quit): ');
    if (returnerIdInput.trim() === '!q') {
        callback();
        return;
    }
    const returnerId = parseInt(returnerIdInput);
    const user = lib.getUserById(returnerId);
    if (!user) {
        console.log(chalk.redBright('✖ User not found.'));
        callback();
        return;
    }
    const borrowedBooks = lib.list().filter(b => b.borrowedBy && b.borrowedBy.includes(returnerId));
    if (borrowedBooks.length === 0) {
        console.log(chalk.yellowBright('You have not borrowed any books.'));
        callback();
        return;
    }
    console.log('Books you are currently borrowing:');
    borrowedBooks.forEach(b => {
        let time = '';
        if (b.borrowedRecords) {
            const rec = [...b.borrowedRecords].reverse().find(r => r.userId === returnerId && !r.returnedAt);
            if (rec) time = ` (borrowed at ${rec.borrowedAt})`;
        }
        console.log(`#${b.id} - ${b.title} by ${b.author}${time}`);
    });
    const ridInput = await prompt('Enter book ID to return (or !q to quit): ');
    if (ridInput.trim() === '!q') {
        callback();
        return;
    }
    const rid = parseInt(ridInput);
    if (lib.returnBook(rid, returnerId)) {
        console.log(chalk.greenBright('✔ Book returned.'));
    } else {
        console.log(chalk.redBright('✖ Cannot return this book. Make sure you have borrowed it.'));
    }
    callback();
}

async function listUsers(callback: () => void) {
    const users = lib.listUsers();
    const table = new Table({
        head: [chalk.cyanBright('ID'), chalk.cyanBright('Name'), chalk.cyanBright('Age')],
        colWidths: [5, 30, 8]
    });
    users.forEach(u => {
        table.push([u.id, u.name, u.age]);
    });
    console.log(table.toString());
    console.log(chalk.greenBright('---------------------------------'));
    callback();
}

async function addUser(callback: () => void) {
    const userId = parseInt(await prompt('Enter user ID: '));
    const name = await prompt('Enter user name: ');
    const age = parseInt(await prompt('Enter user age: '));
    lib.addUser({ id: userId, name, age });
    console.log(chalk.greenBright('✔ User added.'));
    callback();
}

async function searchBooks(callback: () => void) {
    while (true) {
        const keyword = (await prompt('Enter keyword to search (title/author, !q to quit): ')).toLowerCase();
        if (keyword.trim() === '!q') {
            break;
        }
        if(keyword.trim() === '') {
            console.log('Keyword cannot be empty.');
            continue;
        }
        const books = lib.list().filter(b =>
            b.title.toLowerCase().includes(keyword) ||
            b.author.toLowerCase().includes(keyword)
        );
        if (books.length === 0) {
            console.log(chalk.yellowBright('No books found.'));
        } else {
            const table = new Table({
                head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Available'), chalk.cyanBright('Total'), chalk.cyanBright('Borrowed By')],
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
                if (b.minAge) title += ` (${b.minAge}+)`;
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
            console.log(chalk.greenBright('---------------------------------'));
        }
    }
    callback();
}

async function listBorrowedBooks(callback: () => void) {
    const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.length > 0);
    if (books.length === 0) {
        console.log(chalk.yellowBright('No books are currently borrowed.'));
    } else {
        const table = new Table({
            head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Available'), chalk.cyanBright('Total'), chalk.cyanBright('Borrowed By')],
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
                        if (rec) time = ` at ${rec.borrowedAt}`;
                    }
                    return user ? `${user.name}${time}` : `User#${uid}${time}`;
                }).join(', ');
            }
            const available = b.copies - b.borrowedCount;
            let title = b.title;
            if (b.minAge) title += ` (${b.minAge}+)`;
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
        console.log(chalk.greenBright('---------------------------------'));
    }
    callback();
}

async function checkUserDebts(callback: () => void) {
    const userId = parseInt(await prompt('Enter user ID to check: '));
    const user = lib.getUserById(userId);
    if (!user) {
        console.log(chalk.redBright('✖ User not found.'));
        callback();
        return;
    }
    const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.includes(userId));
    if (books.length === 0) {
        console.log(chalk.greenBright(`${user.name} does not have any borrowed books.`));
    } else {
        console.log(chalk.yellowBright(`${user.name} is currently borrowing:`));
        const table = new Table({
            head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Borrowed At')],
            colWidths: [5, 30, 20, 25]
        });
        books.forEach(b => {
            let borrowedAt = '';
            if (b.borrowedRecords) {
                const rec = [...b.borrowedRecords].reverse().find(r => r.userId === userId && !r.returnedAt);
                if (rec) borrowedAt = rec.borrowedAt;
            }
            table.push([
                b.id,
                b.title,
                b.author,
                borrowedAt
            ]);
        });
        console.log(table.toString());
        console.log(chalk.greenBright('---------------------------------'));
    }
    callback();
}

async function mainMenu() {
    showMenu();
    const choice = await prompt('Choose an option: ');
    switch (choice.trim()) {
        case '1':
            await listBooks(mainMenu);
            break;
        case '2':
            await addBook(mainMenu);
            break;
        case '3':
            await borrowBook(mainMenu);
            break;
        case '4':
            await returnBook(mainMenu);
            break;
        case '5':
            await listUsers(mainMenu);
            break;
        case '6':
            await addUser(mainMenu);
            break;
        case '7':
            await searchBooks(mainMenu);
            break;
        case '8':
            await listBorrowedBooks(mainMenu);
            break;
        case '9':
            await checkUserDebts(mainMenu);
            break;
        case '0':
            rl.close();
            break;
        default:
            console.log('Invalid choice.');
            mainMenu();
    }
}

mainMenu();
