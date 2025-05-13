import { Library } from './models/library';
import * as readline from 'readline';
import Table from 'cli-table3';
import chalk from 'chalk';
import { User } from './models/user';
import { Book } from './models/book';
import { BookData } from './entities/bookData';
import { isPositiveInteger, isNonEmptyString, parseIntSafe } from './commons/utils';

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

function isQuitCommand(input: string): boolean {
    return input.trim().toLowerCase() === '!q';
}

function displayBooks(booksToDisplay: Book[], title: string = "Available Books") {
    if (booksToDisplay.length === 0) {
        console.log(chalk.yellowBright(`No books to display for "${title}".`));
        return;
    }
    const table = new Table({
        head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Available'), chalk.cyanBright('Total'), chalk.cyanBright('Min Age'), chalk.cyanBright('Borrowed By')],
        colWidths: [5, 30, 20, 10, 8, 10, 30]
    });
    booksToDisplay.forEach(b => {
        let userInfo = '';
        if (b.borrowedBy && b.borrowedBy.length > 0) {
            userInfo = b.borrowedBy.map(uid => {
                const user = lib.findUserById(uid);
                return user ? user.name : `User#${uid}`;
            }).join(', ');
        }
        table.push([
            b.id,
            b.title,
            b.author,
            b.getAvailableCopies(),
            b.copies,
            b.minAge ? `${b.minAge}+` : '-',
            userInfo
        ]);
    });
    console.log(chalk.bold.magentaBright(`\n--- ${title} ---`));
    console.log(table.toString());
}

function listAllBooks(callback: () => void) {
    const books = lib.listBooks();
    displayBooks(books, "All Library Books");
    console.log(chalk.greenBright('---------------------------------'));
    callback();
}

async function addBook(callback: () => void) {
    while (true) {
        const idStr = await prompt('Enter book ID (or !q to quit): ');
        if (isQuitCommand(idStr)) return callback();
        if (!isPositiveInteger(idStr)) {
            console.log(chalk.redBright('Invalid book ID. Must be a positive integer.'));
            continue;
        }
        const id = parseInt(idStr);

        const title = await prompt('Enter book title (or !q to quit): ');
        if (isQuitCommand(title)) return callback();
        if (!isNonEmptyString(title)) {
            console.log(chalk.redBright('Title cannot be empty.'));
            continue;
        }

        const author = await prompt('Enter author (or !q to quit): ');
        if (isQuitCommand(author)) return callback();
        if (!isNonEmptyString(author)) {
            console.log(chalk.redBright('Author cannot be empty.'));
            continue;
        }    
        
        const copiesStr = await prompt('Enter number of copies (or !q to quit): ');
        if (isQuitCommand(copiesStr)) return callback();
        if (!isPositiveInteger(copiesStr)) {
            console.log(chalk.redBright('Invalid number of copies. Must be a positive integer.'));
            continue;
        }
        const copies = parseInt(copiesStr);

        let minAge: number | undefined = undefined;
        const minAgeStr = await prompt('Enter minimum age (e.g., 12, or leave blank/enter 0 for no restriction, or !q to quit): ');
        if (isQuitCommand(minAgeStr)) return callback();
        if (isNonEmptyString(minAgeStr) && minAgeStr.trim() !== '0') {
            if (!isPositiveInteger(minAgeStr)) {
                console.log(chalk.redBright('Invalid minimum age. Must be a positive integer if specified.'));
                continue;
            }
            minAge = parseInt(minAgeStr);
        }
        
        const bookData: BookData = { id, title, author, copies, minAge };
        const result = lib.addBook(bookData);

        if (typeof result === 'string') {
            console.log(chalk.redBright(`✖ Error adding book: ${result}`));
        } else {
            console.log(chalk.greenBright(`✔ Book "${result.title}" added with ID ${result.id}.`));
            return callback();
        }
        const again = await prompt('Try again? (y/n): ');
        if (again.trim().toLowerCase() !== 'y') return callback();
    }
}

async function borrowBook(callback: () => void) {
    while (true) {
        const bidStr = await prompt('Enter book ID to borrow (or !q to quit): ');
        if (isQuitCommand(bidStr)) return callback();
        if (!isPositiveInteger(bidStr)) {
            console.log(chalk.redBright('Invalid book ID.'));
            continue;
        }
        const bid = parseInt(bidStr);

        const borrowerIdStr = await prompt('Enter your user ID (or !q to quit): ');
        if (isQuitCommand(borrowerIdStr)) return callback();
        if (!isPositiveInteger(borrowerIdStr)) {
            console.log(chalk.redBright('Invalid user ID.'));
            continue;
        }
        const borrowerId = parseInt(borrowerIdStr);

        const result = lib.borrowBook(bid, borrowerId);
        if (result === true) {
            console.log(chalk.greenBright('✔ Book borrowed successfully.'));
            return callback();
        } else {
            console.log(chalk.redBright(`✖ Cannot borrow this book: ${result}`));
        }
        const again = await prompt('Try again? (y/n): ');
        if (again.trim().toLowerCase() !== 'y') return callback();
    }
}

async function returnBook(callback: () => void) {
    while (true) {
        const returnerIdInput = await prompt('Enter your user ID (or !q to quit): ');
        if (isQuitCommand(returnerIdInput)) return callback();
        if (!isPositiveInteger(returnerIdInput)) {
            console.log(chalk.redBright('Invalid user ID.'));
            continue;
        }
        const returnerId = parseInt(returnerIdInput);
        const user = lib.findUserById(returnerId);
        if (!user) {
            console.log(chalk.redBright('✖ User not found.'));
            continue;
        }

        const borrowedBooks = lib.listBooks().filter(b => b.isBorrowedByUser(returnerId));
        if (borrowedBooks.length === 0) {
            console.log(chalk.yellowBright(`${user.name} has not borrowed any books.`));
            return callback();
        }        
        
        const table = new Table({
            head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Borrowed At')],
            colWidths: [5, 30, 20, 30]
        });
        borrowedBooks.forEach(b => {
            let borrowedAtDisplay = 'N/A';
            const record = b.borrowedRecords.find(r => r.userId === returnerId && !r.returnedAt);
            if (record) {
                borrowedAtDisplay = new Date(record.borrowedAt).toLocaleString();
            }
            table.push([b.id, b.title, b.author, borrowedAtDisplay]);
        });
        console.log(chalk.yellowBright(`Books ${user.name} is currently borrowing:`));
        console.log(table.toString());

        while (true) {
            const ridInput = await prompt('Enter book ID to return (or !q to quit): ');
            if (isQuitCommand(ridInput)) return callback();
            if (!isPositiveInteger(ridInput)) {
                console.log(chalk.redBright('Invalid book ID.'));
                continue;
            }
            const rid = parseInt(ridInput);
            const result = lib.returnBook(rid, returnerId);
            if (result === true) {
                console.log(chalk.greenBright('✔ Book returned successfully.'));
                return callback();
            } else {
                console.log(chalk.redBright(`✖ Cannot return this book: ${result}`));
            }
            const again = await prompt('Try again? (y/n): ');
            if (again.trim().toLowerCase() !== 'y') break; 
        }
         const tryDifferentUser = await prompt('Return book for a different user or go back to menu? (d for different user / any other key for menu): ');
        if (tryDifferentUser.trim().toLowerCase() !== 'd') return callback();
    }
}

function showUsers(callback: () => void) {
    const users = lib.listUsers();
     if (users.length === 0) {
        console.log(chalk.yellowBright('No users in the system.'));
    } else {
        const table = new Table({
            head: [chalk.cyanBright('ID'), chalk.cyanBright('Name'), chalk.cyanBright('Age'), chalk.cyanBright('Books Borrowed')],
            colWidths: [5, 30, 8, 15]
        });
        users.forEach(u => {
            table.push([u.id, u.name, u.age, lib.countUserBorrowedBooks(u.id)]);
        });
        console.log(table.toString());
    }
    console.log(chalk.greenBright('---------------------------------'));
    callback();
}

async function addUser(callback: () => void) {
    while (true) {
        const userIdStr = await prompt('Enter user ID (or !q to quit): ');
        if (isQuitCommand(userIdStr)) return callback();
        if (!isPositiveInteger(userIdStr)) {
            console.log(chalk.redBright('Invalid user ID. Must be a positive integer.'));
            continue;
        }
        const userId = parseInt(userIdStr);

        const name = await prompt('Enter user name (or !q to quit): ');
        if (isQuitCommand(name)) return callback();
        if (!isNonEmptyString(name)) {
            console.log(chalk.redBright('Name cannot be empty.'));
            continue;
        }

        const ageStr = await prompt('Enter user age (or !q to quit): ');
        if (isQuitCommand(ageStr)) return callback();
        if (!isPositiveInteger(ageStr)) {
            console.log(chalk.redBright('Invalid age. Must be a positive integer.'));
            continue;
        }
        const age = parseInt(ageStr);
        
        const result = lib.addUser(userId, name, age);
        if (typeof result === 'string') {
            console.log(chalk.redBright(`✖ Error adding user: ${result}`));
        } else {
            console.log(chalk.greenBright(`✔ User "${result.name}" added with ID ${result.id}.`));
            return callback();
        }
        const again = await prompt('Try again? (y/n): ');
        if (again.trim().toLowerCase() !== 'y') return callback();
    }
}

function bookFilter(keyword: string): Book[] {
    const kw = keyword.trim().toLowerCase();
    if (kw === '') {
        console.log(chalk.yellowBright('Keyword cannot be empty.'));
        return [];
    }
    return lib.listBooks().filter(b =>
        b.title.toLowerCase().includes(kw) ||
        b.author.toLowerCase().includes(kw)
    );
}

async function searchBooks(callback: () => void) {
    const keyword = await prompt('Enter keyword to search (title/author, or !q to quit): ');
    if (isQuitCommand(keyword)) return callback();

    const books = bookFilter(keyword);
    if (books.length === 0) {
        console.log(chalk.yellowBright(`No books found for keyword "${keyword}".`));
    } else {
        displayBooks(books, `Search Results for "${keyword}"`);
    }
    searchBooks(callback);
}

function showBorrowedBooks(callback: () => void) {
    const books = lib.listBooks().filter(b => b.borrowedCount > 0);
     if (books.length === 0) {
        console.log(chalk.yellowBright('No books are currently borrowed.'));
    } else {
        const table = new Table({
            head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Borrowed By & When')],
            colWidths: [5, 30, 60]
        });
        books.forEach(b => {
            let borrowedDetails = '';
            if (b.borrowedRecords) {
                 borrowedDetails = b.borrowedRecords
                    .filter(rec => !rec.returnedAt)
                    .map(rec => {
                        const user = lib.findUserById(rec.userId);
                        const userName = user ? user.name : `User#${rec.userId}`;
                        const borrowedDate = new Date(rec.borrowedAt).toLocaleDateString();
                        return `${userName} (on ${borrowedDate})`;
                    }).join('; ');
            }
            table.push([
                b.id,
                b.title,
                borrowedDetails
            ]);
        });
        console.log(table.toString());
    }
    console.log(chalk.greenBright('---------------------------------'));
    callback();
}

async function checkUserDebts(callback: () => void) {
    while (true) {
        const userIdStr = await prompt('Enter user ID to check (or !q to quit): ');
        if (isQuitCommand(userIdStr)) return callback();
        if (!isPositiveInteger(userIdStr)) {
            console.log(chalk.redBright('Invalid user ID.'));
            continue;
        }
        const userId = parseInt(userIdStr);
        const user = lib.findUserById(userId);
        if (!user) {
            console.log(chalk.redBright('✖ User not found.'));
            continue;
        }
        const books = lib.listBooks().filter(b => b.isBorrowedByUser(userId));
        if (books.length === 0) {
            console.log(chalk.greenBright(`${user.name} does not have any borrowed books.`));
        } else {
            console.log(chalk.yellowBright(`${user.name} (Age: ${user.age}) is currently borrowing:`));
            const table = new Table({
                head: [chalk.cyanBright('ID'), chalk.cyanBright('Title'), chalk.cyanBright('Author'), chalk.cyanBright('Borrowed At')],
                colWidths: [5, 30, 20, 30]
            });
            books.forEach(b => {
                let borrowedAtDisplay = 'N/A';
                const record = b.borrowedRecords.find(r => r.userId === userId && !r.returnedAt);
                if (record) {
                     borrowedAtDisplay = new Date(record.borrowedAt).toLocaleString();
                }
                table.push([ b.id, b.title, b.author, borrowedAtDisplay ]);
            });
            console.log(table.toString());
        }
        console.log(chalk.greenBright('---------------------------------'));
        const again = await prompt('Check another user? (y/n): ');
        if (again.trim().toLowerCase() !== 'y') return callback();
    }
}

async function editBook(callback: () => void) {
    let bookToEdit: Book | undefined;
    while (true) {
        const idStr = await prompt('Enter book ID to edit, !s <keyword> to search, or !q to quit: ');
        if (isQuitCommand(idStr)) return callback();

        if (idStr.trim().toLowerCase().startsWith('!s ')) {
            const keyword = idStr.trim().slice(3);
            const foundBooks = bookFilter(keyword);
            if (foundBooks.length === 0) {
                console.log(chalk.yellowBright('No books found matching your search.'));
                continue;
            }
            displayBooks(foundBooks, `Search Results for "${keyword}"`);
            const pickIdStr = await prompt('Enter ID of the book from the list to edit (or !c to cancel search): ');
            if (pickIdStr.trim().toLowerCase() === '!c') continue;
            if (!isPositiveInteger(pickIdStr)) {
                console.log(chalk.redBright('Invalid book ID from search.'));
                continue;
            }
            bookToEdit = lib.findBookById(parseInt(pickIdStr));
        } else {
            if (!isPositiveInteger(idStr)) {
                console.log(chalk.redBright('Invalid book ID format.'));
                continue;
            }
            bookToEdit = lib.findBookById(parseInt(idStr));
        }

        if (!bookToEdit) {
            console.log(chalk.redBright('✖ No book selected to edit.'));
            return callback();
        }
        console.log(chalk.yellowBright(`Editing book: #${bookToEdit.id} - ${bookToEdit.title} by ${bookToEdit.author}`));
        const updateData: { title?: string; author?: string; copies?: number; minAge?: number | null } = {};

        const newTitle = await prompt(`New title [${bookToEdit.title}] (Enter ! to keep): `);
        if (newTitle.trim() !== '!') {
            if (!isNonEmptyString(newTitle)) {
                console.log(chalk.redBright('Title cannot be empty if changed. Edit cancelled for this field.'));
            } else {
                 updateData.title = newTitle;
            }
        }
       
        const newAuthor = await prompt(`New author [${bookToEdit.author}] (Enter ! to keep): `);
        if (newAuthor.trim() !== '!') {
            if (!isNonEmptyString(newAuthor)) {
                console.log(chalk.redBright('Author cannot be empty if changed. Edit cancelled for this field.'));
            } else {
                updateData.author = newAuthor;
            }
        }

        const newCopiesStr = await prompt(`New copies [${bookToEdit.copies}] (Enter ! to keep): `);
        if (newCopiesStr.trim() !== '!') {
            if (!isPositiveInteger(newCopiesStr)) {
                console.log(chalk.redBright('Invalid copies count. Must be a positive integer. Edit cancelled for this field.'));
            } else {
                 const newCopies = parseInt(newCopiesStr);
                 if (newCopies < bookToEdit.borrowedCount) {
                     console.log(chalk.redBright(`Copies cannot be less than currently borrowed count (${bookToEdit.borrowedCount}). Edit cancelled for this field.`));
                 } else {
                    updateData.copies = newCopies;
                 }
            }
        }
     
        const currentMinAgeDisplay = bookToEdit.minAge ? String(bookToEdit.minAge) : 'None';
        const newMinAgeStr = await prompt(`New min age [${currentMinAgeDisplay}] (Enter ! to keep, 0 or empty to clear): `);
        if (newMinAgeStr.trim() !== '!') {
            if (newMinAgeStr.trim() === '' || newMinAgeStr.trim() === '0') {
                updateData.minAge = null; 
            } else if (!isPositiveInteger(newMinAgeStr)) {
                console.log(chalk.redBright('Invalid min age. Must be a positive integer. Edit cancelled for this field.'));
            } else {
                updateData.minAge = parseInt(newMinAgeStr);
            }
        }

        if (Object.keys(updateData).length > 0) {
            const result = lib.updateBook(bookToEdit.id, updateData);
            if (result === true) {
                console.log(chalk.greenBright('✔ Book updated successfully.'));
            } else {
                console.log(chalk.redBright(`✖ Error updating book: ${result}`));
            }
        } else {
            console.log(chalk.yellowBright('No changes were made to the book.'));
        }
        return callback();
    }
}

async function mainMenu() {
    showMenu();
    const choice = await prompt('Choose an option: ');
    switch (choice.trim()) {
        case '1':
            listAllBooks(mainMenu);
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
            showUsers(mainMenu);
            break;
        case '6':
            await addUser(mainMenu);
            break;
        case '7':
            await searchBooks(mainMenu);
            break;
        case '8':
            showBorrowedBooks(mainMenu);
            break;
        case '9':
            await checkUserDebts(mainMenu);
            break;
        case '10':
            await editBook(mainMenu);
            break;
        case '0':
            const save = (await prompt('Do you want to save changes before exiting? (y/n): ')).toLowerCase();
            if (save === 'y' || save === 'yes') {
                try {
                    await lib.saveAll();
                    console.log(chalk.greenBright('✔ Changes saved.'));
                } catch (error) {
                    console.error(chalk.redBright('✖ Failed to save data:'), error instanceof Error ? error.message : String(error));
                }
            } else {
                console.log(chalk.yellowBright('Exiting without saving changes.'));
            }
            rl.close();
            break;
        default:
            console.log(chalk.redBright('Invalid choice. Please try again.'));
            mainMenu();
    }
}

async function startApp() {
    console.log(chalk.blueBright('Loading library data...'));
    try {
        await lib.loadAppData();
        console.log(chalk.greenBright('✔ Library data loaded successfully.'));
        mainMenu();
    } catch (error) {
        console.error(chalk.redBright('✖ Critical error loading application data:'), error instanceof Error ? error.message : String(error));
        console.log(chalk.yellowBright('Application will exit. Please check data files or API connection.'));
        rl.close();
    }
}

startApp();