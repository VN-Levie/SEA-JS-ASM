import { Library } from './library';
import * as readline from 'readline';
import Table from 'cli-table3';
import chalk from 'chalk';
import { User as UserClass } from './user';
import { isPositiveInteger, isNonEmptyString, parseIntSafe } from './utils';

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
    console.log(chalk.yellowBright('10.') + ' Edit book');
    console.log(chalk.yellowBright('0.') + ' Exit');
    console.log(chalk.greenBright('==============================='));
}

function prompt(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

function showBooks(callback: () => void) {
    const books = lib.listBooks();
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
    while (true) {
        const idStr = await prompt('Enter book ID (or !q to quit): ');
        if (idStr.trim() === '!q') return callback();
        if (!isPositiveInteger(idStr)) {
            console.log(chalk.redBright('Invalid book ID.'));
            continue;
        }
        const id = parseInt(idStr);
        if (lib.listBooks().some(b => b.id === id)) {
            console.log(chalk.redBright('Book ID already exists. Please enter a unique ID.'));
            continue;
        }
        const title = await prompt('Enter book title (or !q to quit): ');
        if (title.trim() === '!q') return callback();
        if (!isNonEmptyString(title)) {
            console.log(chalk.redBright('Title cannot be empty.'));
            continue;
        }
        const author = await prompt('Enter author (or !q to quit): ');
        if (author.trim() === '!q') return callback();
        if (!isNonEmptyString(author)) {
            console.log(chalk.redBright('Author cannot be empty.'));
            continue;
        }    
        const existingBook = lib.listBooks().find(
            b => b.title.trim().toLowerCase() === title.trim().toLowerCase() &&
                 b.author.trim().toLowerCase() === author.trim().toLowerCase()
        );
        if (existingBook) {
            console.log(
                chalk.redBright('A book with the same title and author already exists!'),
                chalk.yellow(`(ID: ${existingBook.id})`)
            );
            console.log(
                chalk.yellowBright(
                    `Type !q to return to menu and use "Edit book" with ID: ${existingBook.id} to update this book.`
                )
            );
            continue;
        }
        const copiesStr = await prompt('Enter number of copies (or !q to quit): ');
        if (copiesStr.trim() === '!q') return callback();
        if (!isPositiveInteger(copiesStr)) {
            console.log(chalk.redBright('Invalid number of copies.'));
            continue;
        }
        const copies = parseInt(copiesStr);
        lib.addBook({ id, title, author, copies, borrowedCount: 0, borrowedBy: [] });
        console.log(chalk.greenBright('✔ Book added.'));
        return callback();
    }
}

async function borrowBook(callback: () => void) {
    while (true) {
        const bidStr = await prompt('Enter book ID to borrow (or !q to quit): ');
        if (bidStr.trim() === '!q') return callback();
        if (!isPositiveInteger(bidStr)) {
            console.log(chalk.redBright('Invalid book ID.'));
            continue;
        }
        const bid = parseInt(bidStr);
        const borrowerIdStr = await prompt('Enter your user ID (or !q to quit): ');
        if (borrowerIdStr.trim() === '!q') return callback();
        if (!isPositiveInteger(borrowerIdStr)) {
            console.log(chalk.redBright('Invalid user ID.'));
            continue;
        }
        const borrowerId = parseInt(borrowerIdStr);
        const result = lib.borrowBook(bid, borrowerId);
        if (result === true) {
            console.log(chalk.greenBright('✔ Book borrowed.'));
            return callback();
        } else if (typeof result === 'string') {
            console.log(chalk.redBright('✖ Cannot borrow this book:'), chalk.yellow(result));
        } else {
            console.log(chalk.redBright('✖ Cannot borrow this book. Make sure the book is available, you have not borrowed it yet, and user exists.'));
        }
        const again = await prompt('Try again? (y/n): ');
        if (again.trim().toLowerCase() !== 'y') return callback();
    }
}

async function returnBook(callback: () => void) {
    while (true) {
        const returnerIdInput = await prompt('Enter your user ID (or !q to quit): ');
        if (returnerIdInput.trim() === '!q') return callback();
        if (!isPositiveInteger(returnerIdInput)) {
            console.log(chalk.redBright('Invalid user ID.'));
            continue;
        }
        const returnerId = parseInt(returnerIdInput);
        const user = lib.getUserById(returnerId);
        if (!user) {
            console.log(chalk.redBright('✖ User not found.'));
            continue;
        }
        const borrowedBooks = lib.listBooks().filter(b => b.borrowedBy && b.borrowedBy.includes(returnerId));
        if (borrowedBooks.length === 0) {
            console.log(chalk.yellowBright('You have not borrowed any books.'));
            return callback();
        }        
        const table = new Table({
            head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Borrowed At')],
            colWidths: [5, 30, 20, 25]
        });
        borrowedBooks.forEach(b => {
            let borrowedAt = '';
            if (b.borrowedRecords) {
                const rec = [...b.borrowedRecords].reverse().find(r => r.userId === returnerId && !r.returnedAt);
                if (rec) borrowedAt = rec.borrowedAt;
            }
            table.push([
                b.id,
                b.title,
                b.author,
                borrowedAt
            ]);
        });
        console.log(chalk.yellowBright('Books you are currently borrowing:'));
        console.log(table.toString());
        while (true) {
            const ridInput = await prompt('Enter book ID to return (or !q to quit): ');
            if (ridInput.trim() === '!q') return callback();
            if (!isPositiveInteger(ridInput)) {
                console.log(chalk.redBright('Invalid book ID.'));
                continue;
            }
            const rid = parseInt(ridInput);
            if (lib.returnBook(rid, returnerId)) {
                console.log(chalk.greenBright('✔ Book returned.'));
                return callback();
            } else {
                console.log(chalk.redBright('✖ Cannot return this book. Make sure you have borrowed it.'));
                const again = await prompt('Try again? (y/n): ');
                if (again.trim().toLowerCase() !== 'y') return callback();
            }
        }
    }
}

function showUsers(callback: () => void) {
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
    while (true) {
        const userIdStr = await prompt('Enter user ID (or !q to quit): ');
        if (userIdStr.trim() === '!q') return callback();
        if (!isPositiveInteger(userIdStr)) {
            console.log(chalk.redBright('Invalid user ID.'));
            continue;
        }
        const userId = parseIntSafe(userIdStr);
        if (lib.listUsers().some(u => u.id === userId)) {
            console.log(chalk.redBright('User ID already exists. Please enter a unique ID.'));
            continue;
        }
        const name = await prompt('Enter user name (or !q to quit): ');
        if (name.trim() === '!q') return callback();
        if (!isNonEmptyString(name)) {
            console.log(chalk.redBright('Name cannot be empty.'));
            continue;
        }
        const ageStr = await prompt('Enter user age (or !q to quit): ');
        if (ageStr.trim() === '!q') return callback();
        if (!isPositiveInteger(ageStr)) {
            console.log(chalk.redBright('Invalid age.'));
            continue;
        }
        const age = parseIntSafe(ageStr);
        const user = new UserClass(userId, name, age);
        lib.addUser(user);
        console.log(chalk.greenBright('✔ User added.'));
        return callback();
    }
}

async function searchBooks(callback: () => void) {
    function searchLoop() {
        prompt('Enter keyword to search (title/author, !q to quit): ').then(keyword => {
            const kw = keyword.toLowerCase();
            if (kw.trim() === '!q') {
                callback();
                return;
            }
            if (kw.trim() === '') {
                console.log('Keyword cannot be empty.');
                return searchLoop();
            }
            const books = lib.listBooks().filter(b =>
                b.title.toLowerCase().includes(kw) ||
                b.author.toLowerCase().includes(kw)
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
            searchLoop();
        });
    }
    searchLoop();
}

function showBorrowedBooks(callback: () => void) {
    const books = lib.listBooks().filter(b => b.borrowedBy && b.borrowedBy.length > 0);
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
    while (true) {
        const userIdStr = await prompt('Enter user ID to check (or !q to quit): ');
        if (userIdStr.trim() === '!q') return callback();
        if (!isPositiveInteger(userIdStr)) {
            console.log(chalk.redBright('Invalid user ID.'));
            continue;
        }
        const userId = parseInt(userIdStr);
        const user = lib.getUserById(userId);
        if (!user) {
            console.log(chalk.redBright('✖ User not found.'));
            continue;
        }
        const books = lib.listBooks().filter(b => b.borrowedBy && b.borrowedBy.includes(userId));
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
        return callback();
    }
}

async function editBook(callback: () => void) {
    while (true) {
        const idStr = await prompt('Enter book ID to edit or !s <keyword> to search (or !q to quit): ');
        if (idStr.trim() === '!q') return callback();

        let id: number | undefined;

        if (idStr.trim().startsWith('!s ')) {
            const keyword = idStr.trim().slice(3).toLowerCase();
            if (!keyword) {
                console.log(chalk.redBright('Keyword cannot be empty.'));
                continue;
            }
            const books = lib.listBooks().filter(b =>
                b.title.toLowerCase().includes(keyword) ||
                b.author.toLowerCase().includes(keyword)
            );
            if (books.length === 0) {
                console.log(chalk.yellowBright('No books found.'));
                continue;
            }
            const table = new Table({
                head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Available'), chalk.cyanBright('Total'), chalk.cyanBright('Borrowed By')],
                colWidths: [5, 30, 20, 10, 8, 30]
            });
            books.forEach(b => {
                table.push([b.id, b.title, b.author, b.copies - b.borrowedCount, b.copies, b.borrowedBy ? b.borrowedBy.join(', ') : '']);
            });
            console.log(table.toString());
            const pickIdStr = await prompt('Enter book ID from the above list to edit (or !q to quit): ');
            if (pickIdStr.trim() === '!q') return callback();
            if (!isPositiveInteger(pickIdStr)) {
                console.log(chalk.redBright('Invalid book ID.'));
                continue;
            }
            id = parseInt(pickIdStr);
        } else {
            if (!isPositiveInteger(idStr)) {
                console.log(chalk.redBright('Invalid book ID.'));
                continue;
            }
            id = parseInt(idStr);
        }

        const book = lib.listBooks().find(b => b.id === id);
        if (!book) {
            console.log(chalk.redBright('Book not found.'));
            continue;
        }
        console.log(chalk.yellowBright(`Editing book: #${book.id} - ${book.title} by ${book.author}`));
      
        const newTitle = await prompt(`Enter new title [${book.title}] (or ! to keep): `);
       
        const newAuthor = await prompt(`Enter new author [${book.author}] (or ! to keep): `);

        const newCopiesStr = await prompt(`Enter new number of copies [${book.copies}] (or ! to keep): `);
     
        const newMinAgeStr = await prompt(`Enter new min age [${book.minAge ?? ''}] (or ! to keep): `);

        const updateData: any = {};
        if (newTitle.trim() !== '!') {
            if (!isNonEmptyString(newTitle)) {
                console.log(chalk.redBright('Title cannot be empty.'));
                continue;
            }
            updateData.title = newTitle;
        }
        if (newAuthor.trim() !== '!') {
            if (!isNonEmptyString(newAuthor)) {
                console.log(chalk.redBright('Author cannot be empty.'));
                continue;
            }
            updateData.author = newAuthor;
        }
        if (newCopiesStr.trim() !== '!') {
            if (!isPositiveInteger(newCopiesStr)) {
                console.log(chalk.redBright('Invalid number of copies.'));
                continue;
            }
            const newCopies = parseInt(newCopiesStr);
            if (newCopies < (book.borrowedCount || 0)) {
                console.log(chalk.redBright('Copies cannot be less than currently borrowed count.'));
                continue;
            }
            updateData.copies = newCopies;
        }
        if (newMinAgeStr.trim() !== '!') {
            if (!isPositiveInteger(newMinAgeStr)) {
                console.log(chalk.redBright('Invalid min age.'));
                continue;
            }
            updateData.minAge = parseInt(newMinAgeStr);
        }
        if (Object.keys(updateData).length === 0) {
            console.log(chalk.yellowBright('No changes made.'));
        } else {
            lib.updateBook(id, updateData);
            console.log(chalk.greenBright('✔ Book updated.'));
        }
        return callback();
    }
}

async function mainMenu() {
    showMenu();
    const choice = await prompt('Choose an option: ');
    switch (choice.trim()) {
        case '1':
            showBooks(mainMenu);
            break;
        case '2':
            addBook(mainMenu);
            break;
        case '3':
            borrowBook(mainMenu);
            break;
        case '4':
            returnBook(mainMenu);
            break;
        case '5':
            showUsers(mainMenu);
            break;
        case '6':
            addUser(mainMenu);
            break;
        case '7':
            searchBooks(mainMenu);
            break;
        case '8':
            showBorrowedBooks(mainMenu);
            break;
        case '9':
            checkUserDebts(mainMenu);
            break;
        case '10':
            editBook(mainMenu);
            break;
        case '0':
            const save = (await prompt('Do you want to save changes before exiting? (y/n): ')).toLowerCase();
            if (save === 'y' || save === 'yes') {
                await lib.saveAll();
                console.log(chalk.greenBright('✔ Changes saved.'));
            } else {
                console.log(chalk.yellowBright('Exiting without saving changes.'));
            }
            rl.close();
            break;
        default:
            console.log('Invalid choice.');
            mainMenu();
    }
}

mainMenu();
