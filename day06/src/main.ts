import { Library, User } from './Library';
import { BookStatus, Book } from './Book';
import * as readline from 'readline';
import Table from 'cli-table3';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lib = new Library();

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

function prompt(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

async function listBooks(callback: () => void) {
    const books = lib.list();
    const table = new Table({
        head: ['ID', 'Title', 'Author', 'Available', 'Total', 'Borrowed By'],
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
        table.push([
            b.id,
            b.title,
            b.author,
            available,
            b.copies,
            userInfo
        ]);
    });
    console.log(table.toString());
    callback();
}

async function addBook(callback: () => void) {
    const id = parseInt(await prompt('Enter book ID: '));
    const title = await prompt('Enter book title: ');
    const author = await prompt('Enter author: ');
    const copies = parseInt(await prompt('Enter number of copies: '));
    lib.addBook({ id, title, author, copies, borrowedCount: 0, borrowedBy: [] });
    console.log('Book added.');
    callback();
}

async function borrowBook(callback: () => void) {
    const bid = parseInt(await prompt('Enter book ID to borrow: '));
    const borrowerId = parseInt(await prompt('Enter your user ID: '));
    const result = lib.borrowBook(bid, borrowerId);
    if (result === true) {
        console.log('Book borrowed.');
    } else if (typeof result === 'string') {
        console.log('Cannot borrow this book:', result);
    } else {
        console.log('Cannot borrow this book. Make sure the book is available, you have not borrowed it yet, and user exists.');
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
        console.log('Book returned.');
    } else {
        console.log('Cannot return this book. Make sure you have borrowed it.');
    }
    callback();
}

async function listUsers(callback: () => void) {
    const users = lib.listUsers();
    users.forEach(u => {
        console.log(`#${u.id} - ${u.name}`);
    });
    callback();
}

async function addUser(callback: () => void) {
    const userId = parseInt(await prompt('Enter user ID: '));
    const name = await prompt('Enter user name: ');
    lib.addUser({ id: userId, name });
    console.log('User added.');
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
            console.log('No books found.');
        } else {
            const table = new Table({
                head: ['ID', 'Title', 'Author', 'Available', 'Total', 'Borrowed By'],
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
                table.push([
                    b.id,
                    b.title,
                    b.author,
                    available,
                    b.copies,
                    userInfo
                ]);
            });
            console.log(table.toString());
        }
    }
    callback();
}

async function listBorrowedBooks(callback: () => void) {
    const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.length > 0);
    if (books.length === 0) {
        console.log('No books are currently borrowed.');
    } else {
        const table = new Table({
            head: ['ID', 'Title', 'Author', 'Available', 'Total', 'Borrowed By'],
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
            table.push([
                b.id,
                b.title,
                b.author,
                available,
                b.copies,
                userInfo
            ]);
        });
        console.log(table.toString());
    }
    callback();
}

async function checkUserDebts(callback: () => void) {
    const userId = parseInt(await prompt('Enter user ID to check: '));
    const user = lib.getUserById(userId);
    if (!user) {
        console.log('User not found.');
        callback();
        return;
    }
    const books = lib.list().filter(b => b.borrowedBy && b.borrowedBy.includes(userId));
    if (books.length === 0) {
        console.log(`${user.name} does not have any borrowed books.`);
    } else {
        console.log(`${user.name} is currently borrowing:`);
        books.forEach(b => {
            let time = '';
            if (b.borrowedRecords) {
                const rec = [...b.borrowedRecords].reverse().find(r => r.userId === userId && !r.returnedAt);
                if (rec) time = ` (borrowed at ${rec.borrowedAt})`;
            }
            console.log(`#${b.id} - ${b.title} by ${b.author}${time}`);
        });
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
