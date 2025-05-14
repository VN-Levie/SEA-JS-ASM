import inquirer from 'inquirer';
import { TaskManager } from './services/TaskManager';
import { JsonFileStorageService } from './services/storage/JsonFileStorageService';
import { IStorageService } from './services/storage/IStorageService';
import { displayTasks, displayUsers, printMessage } from './utils/cliUtils';
import { Task, TaskPriority, TaskStatus } from './models/Task';
import { User } from './models/User';
import chalk from 'chalk'; // Inquirer dùng chalk nên có thể tận dụng

const storageService: IStorageService = new JsonFileStorageService();
const taskManager = TaskManager.getInstance(storageService);

async function mainLoop() {
    await taskManager.initialize(); // Tải dữ liệu khi bắt đầu

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
                    { name: '🆔 Get Task by ID', value: 'getTaskById' },
                    { name: '🔄 Update Task Status', value: 'updateTaskStatus' },
                    { name: '✏️ Update Task Details', value: 'updateTaskDetails' },
                    { name: '🗑️ Delete Task', value: 'deleteTask' },
                    new inquirer.Separator(),
                    { name: '👤 Add New User', value: 'addUser' },
                    { name: '👥 List All Users', value: 'listUsers' },
                    { name: '🤝 Assign Task to User', value: 'assignTask' },
                    new inquirer.Separator(),
                    { name: '🚪 Exit', value: 'exit' },
                ],
                pageSize: 15
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
                case 'exit':
                    printMessage('Exiting Task Manager. Goodbye!', 'info');
                    return;
            }
        } catch (error) {
            if (error instanceof Error) {
                printMessage(`An error occurred: ${error.message}`, 'error');
            } else {
                printMessage('An unknown error occurred.', 'error');
            }
        }
        await inquirer.prompt([{ type: 'input', name: 'continue', message: chalk.dim('\nPress Enter to continue...'), default:'' }]);
        console.clear(); // Xóa màn hình cho menu tiếp theo (có thể không hoạt động trên mọi terminal)
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
        { type: 'input', name: 'dueDate', message: 'Due Date (YYYY-MM-DD, optional):', validate: input => {
            if (!input) return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(input) ? true : 'Please use YYYY-MM-DD format.';
        }},
    ]);

    const dueDate = answers.dueDate ? new Date(answers.dueDate) : undefined;
    const newTask = await taskManager.addTask(answers.title, answers.description, answers.priority, dueDate);
    printMessage(`Task "${newTask.title}" added with ID: ${newTask.id}`, 'success');
}

function handleListTasks() {
    const tasks = taskManager.getAllTasks();
    displayTasks(tasks);
}

async function handleGetTaskById() {
    const { taskId } = await inquirer.prompt([
        { type: 'input', name: 'taskId', message: 'Enter Task ID:', validate: input => input ? true : 'Task ID cannot be empty.' },
    ]);
    const task = taskManager.getTaskById(taskId);
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
            choices: tasks.map(task => ({name: `${task.title} (ID: ${task.id})`, value: task.id})),
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
    const updatedTask = await taskManager.updateTask(taskIdToUpdate, { status: newStatus as TaskStatus });
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
            choices: tasks.map(task => ({name: `${task.title} (ID: ${task.id})`, value: task.id})),
            pageSize: 10
        }
    ]);

    const taskToUpdate = taskManager.getTaskById(taskIdToUpdate);
    if (!taskToUpdate) {
        printMessage('Task not found.', 'error');
        return;
    }

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
        { type: 'input', name: 'dueDate', message: `New Due Date (YYYY-MM-DD, current: ${taskToUpdate.dueDate ? taskToUpdate.dueDate.toISOString().split('T')[0] : ''}):`, default: taskToUpdate.dueDate ? taskToUpdate.dueDate.toISOString().split('T')[0] : '', validate: input => {
            if (!input) return true;
            return /^\d{4}-\d{2}-\d{2}$/.test(input) ? true : 'Please use YYYY-MM-DD format.';
        }},
    ]);

    const finalUpdates: Partial<Task> = {};
    if (updates.title !== taskToUpdate.title) finalUpdates.title = updates.title;
    if (updates.description !== (taskToUpdate.description || '')) finalUpdates.description = updates.description;
    if (updates.priority !== taskToUpdate.priority) finalUpdates.priority = updates.priority as TaskPriority;

    const currentDueDateStr = taskToUpdate.dueDate ? taskToUpdate.dueDate.toISOString().split('T')[0] : '';
    if (updates.dueDate !== currentDueDateStr) {
        finalUpdates.dueDate = updates.dueDate ? new Date(updates.dueDate) : undefined;
    }


    if (Object.keys(finalUpdates).length > 0) {
        const updatedTask = await taskManager.updateTask(taskIdToUpdate, finalUpdates);
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
            choices: tasks.map(task => ({name: `${task.title} (ID: ${task.id})`, value: task.id})),
            pageSize: 10
        }
    ]);

    const { confirmDelete } = await inquirer.prompt([
        { type: 'confirm', name: 'confirmDelete', message: `Are you sure you want to delete task ID ${taskIdToDelete}?`, default: false}
    ]);

    if (confirmDelete) {
        const deleted = await taskManager.deleteTask(taskIdToDelete);
        if (deleted) {
            printMessage(`Task with ID "${taskIdToDelete}" deleted.`, 'success');
        } else {
            printMessage(`Failed to delete task. Task not found.`, 'error');
        }
    } else {
        printMessage('Deletion cancelled.', 'info');
    }
}

async function handleAddUser() {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'User Name:', validate: input => input ? true : 'Name cannot be empty.' },
        { type: 'input', name: 'email', message: 'Email (optional):' },
    ]);
    const newUser = await taskManager.addUser(answers.name, answers.email);
    printMessage(`User "${newUser.name}" added with ID: ${newUser.id}`, 'success');
}

function handleListUsers() {
    const users = taskManager.getAllUsers();
    displayUsers(users);
}

async function handleAssignTask() {
    const tasks = taskManager.getAllTasks().filter(t => t.status !== TaskStatus.Done && t.status !== TaskStatus.Cancelled);
    const users = taskManager.getAllUsers();

    if (tasks.length === 0) {
        printMessage('No active tasks available to assign.', 'info');
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
            choices: tasks.map(task => ({name: `${task.title} (ID: ${task.id}, Current Assignee: ${task.assigneeId || 'None'})`, value: task.id})),
            pageSize: 10
        }
    ]);

     const { userIdToAssign } = await inquirer.prompt([
        {
            type: 'list',
            name: 'userIdToAssign',
            message: 'Select User to assign to:',
            choices: [{name: 'Unassign Task', value: null}, ...users.map(user => ({name: `${user.name} (ID: ${user.id})`, value: user.id}))],
            pageSize: 10
        }
    ]);
    
    const assigneeId = userIdToAssign === null ? undefined : userIdToAssign;

    const assignedTask = await taskManager.updateTask(taskIdToAssign, { assigneeId: assigneeId });

    if (assignedTask) {
        if(assigneeId) {
            printMessage(`Task "${assignedTask.title}" assigned to user ID "${assigneeId}".`, 'success');
        } else {
            printMessage(`Task "${assignedTask.title}" unassigned.`, 'success');
        }
    } else {
        printMessage(`Could not assign task. Task ID "${taskIdToAssign}" not found.`, 'warning');
    }
}


mainLoop().catch(error => {
    printMessage(`A critical error occurred: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
});