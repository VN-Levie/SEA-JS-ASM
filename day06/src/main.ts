import { Library } from './Library';
import { BookStatus, Book } from './Book';
import * as readline from 'readline';

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
    console.log('0. Exit');
}

function prompt(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
    let running = true;
    while (running) {
        showMenu();
        const choice = await prompt('Choose an option: ');
        switch (choice.trim()) {
            case '1':
                const books = lib.list();
                books.forEach(b => {
                    console.log(`#${b.id} - ${b.title} by ${b.author} [${BookStatus[b.status]}]`);
                });
                break;
            case '2':
                const id = parseInt(await prompt('Enter book ID: '));
                const title = await prompt('Enter book title: ');
                const author = await prompt('Enter author: ');
                lib.addBook({ id, title, author, status: BookStatus.Available });
                console.log('Book added.');
                break;
            case '3':
                const bid = parseInt(await prompt('Enter book ID to borrow: '));
                if (lib.borrowBook(bid)) {
                    console.log('Book borrowed.');
                } else {
                    console.log('Cannot borrow this book.');
                }
                break;
            case '4':
                const rid = parseInt(await prompt('Enter book ID to return: '));
                lib.returnBook(rid);
                console.log('Book returned.');
                break;
            case '0':
                running = false;
                break;
            default:
                console.log('Invalid choice.');
        }
    }

    rl.close();
}

main();
