import inquirer from 'inquirer';
import { TaskManager } from './services/TaskManager';
import { JsonFileStorageService } from './services/storage/JsonFileStorageService';
import { IStorageService } from './services/storage/IStorageService';
import { displayTasks, displayUsers, printMessage } from './utils/cliUtils';
import { Task, TaskPriority, TaskStatus } from './models/Task';
import chalk from 'chalk'; 
import { parseNaturalDate } from './utils/dateUtils';

const storageService: IStorageService = new JsonFileStorageService();
const taskManager = TaskManager.getInstance(storageService);

let currentUser: import('./models/User').User | null = null;

let isSaving = false;
async function saveOnExit() {
    if (isSaving) return;
    isSaving = true;
    try {
        await taskManager.saveAll();
    } catch (e) {        
    }
}
process.on('SIGINT', async () => {
    await saveOnExit();
    process.exit();
});
process.on('SIGTERM', async () => {
    await saveOnExit();
    process.exit();
});
process.on('exit', () => {   
    if (!isSaving) taskManager.saveAll();
});
// --- End process exit handler ---

async function loginFlow() {
    const users = taskManager.getAllUsers();
    if (users.length === 0) {
        printMessage('No users found. Please create a user first.', 'warning');
        await handleAddUser();
    }
    while (true) {
        const { loginType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'loginType',
                message: 'Login by:',
                choices: [
                    { name: 'User ID', value: 'id' },
                    { name: 'Email', value: 'email' },
                ]
            }
        ]);
        let user: import('./models/User').User | undefined;
        if (loginType === 'id') {
            const { id } = await inquirer.prompt([
                { type: 'input', name: 'id', message: 'Enter your User ID:', validate: input => /^\d+$/.test(input) ? true : 'ID must be a number.' }
            ]);
            user = taskManager.getUserById(Number(id));
        } else {
            const { email } = await inquirer.prompt([
                { type: 'input', name: 'email', message: 'Enter your Email:' }
            ]);
            user = users.find(u => u.email === email);
        }
        if (user) {
            currentUser = user;
            printMessage(`Logged in as ${user.name} (ID: ${user.id})`, 'success');
            break;
        } else {
            printMessage('User not found. Try again.', 'error');
        }
    }
}

async function mainLoop() {
    await taskManager.initialize(); // Tải dữ liệu khi bắt đầu
    await loginFlow();
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk.bold.cyanBright('Task Management Menu - What would you like to do?'),
                choices: [
                    { name: '📝 Add New Task', value: 'addTask' },
                    { name: '📄 List All Tasks', value: 'listTasks' },
                    { name: '🔍 Search Tasks', value: 'searchTasks' },
                    { name: '🔎 Filter Tasks', value: 'filterTasks' },
                    { name: '📊 Task Statistics', value: 'taskStats' },
                    { name: '🆔 Get Task by ID', value: 'getTaskById' },
                    { name: '🔄 Update Task Status', value: 'updateTaskStatus' },
                    { name: '✏️ Update Task Details', value: 'updateTaskDetails' },
                    { name: '🗑️ Delete Task', value: 'deleteTask' },
                    new inquirer.Separator(),
                    { name: '👤 Add New User', value: 'addUser' },
                    { name: '👥 List All Users', value: 'listUsers' },
                    { name: '🤝 Assign Task to User', value: 'assignTask' },
                    { name: '🔓 Logout', value: 'logout' },
                    new inquirer.Separator(),
                    { name: '🚪 Exit', value: 'exit' },
                ],
                pageSize: 18
            },
        ]);

        try {
            switch (action) {
                case 'addTask':
                    await handleAddTask();
                    break;
                case 'listTasks':
                    handleListTasks();
                    break;
                case 'searchTasks':
                    await handleSearchTasks();
                    break;
                case 'filterTasks':
                    await handleFilterTasks();
                    break;
                case 'taskStats':
                    await handleTaskStats();
                    break;
                case 'getTaskById':
                    await handleGetTaskById();
                    break;
                case 'updateTaskStatus':
                    await handleUpdateTaskStatus();
                    break;
                case 'updateTaskDetails':
                    await handleUpdateTaskDetails();
                    break;
                case 'deleteTask':
                    await handleDeleteTask();
                    break;
                case 'addUser':
                    await handleAddUser();
                    break;
                case 'listUsers':
                    handleListUsers();
                    break;
                case 'assignTask':
                    await handleAssignTask();
                    break;
                case 'logout':
                    currentUser = null;
                    printMessage('Logged out.', 'info');
                    await loginFlow();
                    break;
                case 'exit':
                    printMessage('Exiting Task Manager. Goodbye!', 'info');
                    isSaving = true; 
                    await taskManager.saveAll();                   
                    return;
            }
        } catch (error) {
            if (error instanceof Error) {
                printMessage(`An error occurred: ${error.message}`, 'error');
            } else {
                printMessage('An unknown error occurred.', 'error');
            }
        }
        await inquirer.prompt([{ type: 'input', name: 'continue', message: chalk.dim('\nPress Enter to continue...'), default: '' }]);
        console.clear();
    }
}

async function handleAddTask() {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Task Title:', validate: input => input ? true : 'Title cannot be empty.' },
        { type: 'input', name: 'description', message: 'Description (optional):' },
        {
            type: 'list',
            name: 'priority',
            message: 'Priority:',
            choices: Object.values(TaskPriority),
            default: TaskPriority.Medium,
        },
        {
            type: 'list',
            name: 'dueDatePreset',
            message: 'Due Date:',
            choices: [
                { name: 'No due date', value: '' },
                { name: 'In 1 day', value: '1 day' },
                { name: 'In 7 days', value: '7 days' },
                { name: 'In 1 month', value: '1 month' },
                { name: 'Enter custom (e.g. "7 days", "12h", "this last month", or YYYY-MM-DD)', value: 'custom' }
            ],
            default: '',
        },
        {
            type: 'input',
            name: 'dueDateCustom',
            message: 'Enter due date (e.g. "7 days", "12h", "this last month", or YYYY-MM-DD):',
            when: (answers) => answers.dueDatePreset === 'custom',
            validate: input => {
                if (!input) return true;
                const date = parseNaturalDate(input);
                if (!date || isNaN(date.getTime())) return 'Invalid date format or expression.';
                return true;
            }
        }
    ]);

    let dueDate: Date | undefined = undefined;
    if (answers.dueDatePreset && answers.dueDatePreset !== 'custom') {
        dueDate = parseNaturalDate(answers.dueDatePreset);
    } else if (answers.dueDatePreset === 'custom' && answers.dueDateCustom) {
        dueDate = parseNaturalDate(answers.dueDateCustom);
    }

    const newTask = await taskManager.addTask(answers.title, answers.description, answers.priority, dueDate);
    printMessage(`Task "${newTask.title}" added with ID: ${newTask.id}`, 'success');
}

function handleListTasks() {
    const tasks = taskManager.getAllTasks();
    displayTasks(tasks);
}

async function handleSearchTasks() {
    const { keyword } = await inquirer.prompt([
        { type: 'input', name: 'keyword', message: 'Enter keyword to search (title/description):', validate: input => input.trim() ? true : 'Keyword cannot be empty.' }
    ]);
    const kw = keyword.trim().toLowerCase();
    const tasks = taskManager.getAllTasks().filter(task =>
        (task.title && task.title.toLowerCase().includes(kw)) ||
        (task.description && task.description.toLowerCase().includes(kw))
    );
    if (tasks.length === 0) {
        printMessage(`No tasks found for keyword "${keyword}".`, 'warning');
    } else {
        displayTasks(tasks);
    }
}

async function handleFilterTasks() {
    const filterChoices = [
        { name: 'By Status', value: 'status' },
        { name: 'By Priority', value: 'priority' },
        { name: 'By Assignee', value: 'assignee' },
        { name: 'Overdue Tasks', value: 'overdue' },
    ];
    const { filterType } = await inquirer.prompt([
        { type: 'list', name: 'filterType', message: 'Filter tasks by:', choices: filterChoices }
    ]);
    let filtered: Task[] = [];
    if (filterType === 'status') {
        const { status } = await inquirer.prompt([
            { type: 'list', name: 'status', message: 'Select status:', choices: Object.values(TaskStatus) }
        ]);
        filtered = taskManager.getTasksByStatus(status as TaskStatus);
    } else if (filterType === 'priority') {
        const { priority } = await inquirer.prompt([
            { type: 'list', name: 'priority', message: 'Select priority:', choices: Object.values(TaskPriority) }
        ]);
        filtered = taskManager.getTasksByPriority(priority as TaskPriority);
    } else if (filterType === 'assignee') {
        const users = taskManager.getAllUsers();
        if (users.length === 0) {
            printMessage('No users found.', 'warning');
            return;
        }
        const { userId } = await inquirer.prompt([
            { type: 'list', name: 'userId', message: 'Select assignee:', choices: users.map(u => ({ name: `${u.name} (ID: ${u.id})`, value: u.id })) }
        ]);
        filtered = taskManager.getAllTasks().filter(task => task.assigneeId === userId);
    } else if (filterType === 'overdue') {
        filtered = taskManager.getAllTasks().filter(task => task.isOverdue());
    }
    if (filtered.length === 0) {
        printMessage('No tasks found for this filter.', 'warning');
    } else {
        displayTasks(filtered);
    }
}

async function handleTaskStats() {
    const tasks = taskManager.getAllTasks();
    const users = taskManager.getAllUsers();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.Done).length;
    const overdue = tasks.filter(t => t.isOverdue()).length;
    const byUser = users.map(u => ({ name: u.name, id: u.id, count: tasks.filter(t => t.assigneeId === u.id).length }));
    printMessage('--- Task Statistics ---', 'info');
    console.log(`Total tasks: ${total}`);
    console.log(`Completed tasks: ${completed}`);
    console.log(`Overdue tasks: ${overdue}`);
    console.log('Tasks per user:');
    byUser.forEach(u => {
        console.log(`- ${u.name} (ID: ${u.id}): ${u.count}`);
    });
}

async function handleGetTaskById() {
    const { taskId } = await inquirer.prompt([
        { type: 'input', name: 'taskId', message: 'Enter Task ID:', validate: input => /^\d+$/.test(input) ? true : 'Task ID must be a number.' },
    ]);
    const task = taskManager.getTaskById(Number(taskId));
    if (task) {
        displayTasks([task]);
    } else {
        printMessage(`Task with ID "${taskId}" not found.`, 'warning');
    }
}

async function handleUpdateTaskStatus() {
    const tasks = taskManager.getAllTasks();
    if (tasks.length === 0) {
        printMessage('No tasks available to update.', 'info');
        return;
    }
    const { taskIdToUpdate } = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskIdToUpdate',
            message: 'Select Task to update status:',
            choices: tasks.map(task => ({ name: `${task.title} (ID: ${task.id})`, value: task.id })),
            pageSize: 10
        }
    ]);

    const { newStatus } = await inquirer.prompt([
        {
            type: 'list',
            name: 'newStatus',
            message: 'New Status:',
            choices: Object.values(TaskStatus),
        },
    ]);
    const updatedTask = await taskManager.updateTask(Number(taskIdToUpdate), { status: newStatus as TaskStatus });
    if (updatedTask) {
        printMessage(`Task "${updatedTask.title}" status updated to ${newStatus}.`, 'success');
    } else {
        printMessage(`Failed to update task. Task not found.`, 'error');
    }
}

async function handleUpdateTaskDetails() {
    const tasks = taskManager.getAllTasks();
    if (tasks.length === 0) {
        printMessage('No tasks available to update.', 'info');
        return;
    }
    const { taskIdToUpdate } = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskIdToUpdate',
            message: 'Select Task to update details:',
            choices: tasks.map(task => ({ name: `${task.title} (ID: ${task.id})`, value: task.id })),
            pageSize: 10
        }
    ]);

    const taskToUpdate = taskManager.getTaskById(Number(taskIdToUpdate));
    if (!taskToUpdate) {
        printMessage('Task not found.', 'error');
        return;
    }

    const currentDueDateStr = taskToUpdate.dueDate ? taskToUpdate.dueDate.toISOString().split('T')[0] : '';

    const updates = await inquirer.prompt([
        { type: 'input', name: 'title', message: `New Title (current: ${taskToUpdate.title}):`, default: taskToUpdate.title },
        { type: 'input', name: 'description', message: `New Description (current: ${taskToUpdate.description || ''}):`, default: taskToUpdate.description || '' },
        {
            type: 'list',
            name: 'priority',
            message: `New Priority (current: ${taskToUpdate.priority}):`,
            choices: Object.values(TaskPriority),
            default: taskToUpdate.priority,
        },
        {
            type: 'list',
            name: 'dueDatePreset',
            message: `New Due Date (current: ${currentDueDateStr}):`,
            choices: [
                { name: 'No due date', value: '' },
                { name: 'In 1 day', value: '1 day' },
                { name: 'In 7 days', value: '7 days' },
                { name: 'In 1 month', value: '1 month' },
                { name: 'Enter custom (e.g. "7 days", "12h", "this last month", or YYYY-MM-DD)', value: 'custom' }
            ],
            default: '',
        },
        {
            type: 'input',
            name: 'dueDateCustom',
            message: 'Enter due date (e.g. "7 days", "12h", "this last month", or YYYY-MM-DD):',
            when: (answers) => answers.dueDatePreset === 'custom',
            validate: input => {
                if (!input) return true;
                const date = parseNaturalDate(input);
                if (!date || isNaN(date.getTime())) return 'Invalid date format or expression.';
                return true;
            }
        }
    ]);

    const finalUpdates: Partial<Task> = {};
    if (updates.title !== taskToUpdate.title) finalUpdates.title = updates.title;
    if (updates.description !== (taskToUpdate.description || '')) finalUpdates.description = updates.description;
    if (updates.priority !== taskToUpdate.priority) finalUpdates.priority = updates.priority as TaskPriority;

    let dueDate: Date | undefined = undefined;
    if (updates.dueDatePreset && updates.dueDatePreset !== 'custom') {
        dueDate = parseNaturalDate(updates.dueDatePreset);
    } else if (updates.dueDatePreset === 'custom' && updates.dueDateCustom) {
        dueDate = parseNaturalDate(updates.dueDateCustom);
    }
    if (dueDate !== undefined || updates.dueDatePreset === '') {
        finalUpdates.dueDate = dueDate;
    }

    if (Object.keys(finalUpdates).length > 0) {
        const updatedTask = await taskManager.updateTask(Number(taskIdToUpdate), finalUpdates);
        if (updatedTask) {
            printMessage(`Task "${updatedTask.title}" details updated.`, 'success');
        } else {
            printMessage(`Failed to update task.`, 'error');
        }
    } else {
        printMessage('No changes detected.', 'info');
    }
}

async function handleDeleteTask() {
    const tasks = taskManager.getAllTasks();
    if (tasks.length === 0) {
        printMessage('No tasks available to delete.', 'info');
        return;
    }
    const { taskIdToDelete } = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskIdToDelete',
            message: 'Select Task to delete:',
            choices: tasks.map(task => ({ name: `${task.title} (ID: ${task.id})`, value: task.id })),
            pageSize: 10
        }
    ]);

    const { confirmDelete } = await inquirer.prompt([
        { type: 'confirm', name: 'confirmDelete', message: `Are you sure you want to delete task ID ${taskIdToDelete}?` }
    ]);

    if (confirmDelete) {
        const deleted = await taskManager.deleteTask(Number(taskIdToDelete));
        if (deleted) {
            printMessage(`Task ID ${taskIdToDelete} deleted successfully.`, 'success');
        } else {
            printMessage(`Failed to delete task ID ${taskIdToDelete}.`, 'error');
        }
    } else {
        printMessage('Task deletion cancelled.', 'info');
    }
}

async function handleAddUser() {
    const users = taskManager.getAllUsers();
    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'User Name:', validate: input => input ? true : 'Name cannot be empty.' },
        { type: 'input', name: 'email', message: 'Email:',
            validate: (input: string) => {
                if (!input) return 'Email cannot be empty.';
                const emailRegex = /^\S+@\S+\.\S+$/;
                if (!emailRegex.test(input)) return 'Invalid email format.';
                if (users.some(u => u.email && u.email.toLowerCase() === input.toLowerCase())) return 'Email already exists.';
                return true;
            }
        }
    ]);
    const newUser = await taskManager.addUser(answers.name, answers.email);
    printMessage(`User "${newUser.name}" added with ID: ${newUser.id}`, 'success');
}

function handleListUsers() {
    const users = taskManager.getAllUsers();
    displayUsers(users);
}

async function handleAssignTask() {
    const tasks = taskManager.getAllTasks();
    const users = taskManager.getAllUsers();
    if (tasks.length === 0) {
        printMessage('No tasks available to assign.', 'info');
        return;
    }
    if (users.length === 0) {
        printMessage('No users available to assign tasks to.', 'info');
        return;
    }
    const { taskIdToAssign } = await inquirer.prompt([
        {
            type: 'list',
            name: 'taskIdToAssign',
            message: 'Select Task to assign:',
            choices: tasks.map(task => ({ name: `${task.title} (ID: ${task.id})`, value: task.id })),
            pageSize: 10
        }
    ]);
    const { userIdToAssign } = await inquirer.prompt([
        {
            type: 'list',
            name: 'userIdToAssign',
            message: 'Select User to assign task to:',
            choices: users.map(user => ({ name: `${user.name} (ID: ${user.id})`, value: user.id })),
            pageSize: 10
        }
    ]);
    const updatedTask = await taskManager.assignTaskToUser(Number(taskIdToAssign), Number(userIdToAssign));
    if (updatedTask) {
        printMessage(`Task "${updatedTask.title}" assigned to user ID ${userIdToAssign}.`, 'success');
    } else {
        printMessage('Failed to assign task.', 'error');
    }
}

mainLoop();