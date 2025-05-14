import { TaskManager } from './services/TaskManager';
import { JsonFileStorageService } from './services/storage/JsonFileStorageService';
import { IStorageService } from './services/storage/IStorageService';
import { displayTasks, displayUsers, printMessage } from './utils/cliUtils';
import { TaskPriority, TaskStatus } from './models/Task';

async function main() {
    const storageService: IStorageService = new JsonFileStorageService();
    const taskManager = TaskManager.getInstance(storageService);
    await taskManager.initialize();

    const args = process.argv.slice(2);
    const command = args[0];

    try {
        switch (command) {
            case 'add-task':
                const title = args[1];
                if (!title) {
                    printMessage('Task title is required.', 'error');
                    break;
                }
                const newTask = await taskManager.addTask(title, args[2], args[3] as TaskPriority, args[4] ? new Date(args[4]) : undefined);
                printMessage(`Task "${newTask.title}" added with ID: ${newTask.id}`, 'success');
                break;

            case 'list-tasks':
                const tasks = taskManager.getAllTasks();
                displayTasks(tasks);
                break;
            
            case 'get-task':
                const taskId = args[1];
                if(!taskId) {
                    printMessage('Task ID is required for get-task.', 'error');
                    break;
                }
                const foundTask = taskManager.getTaskById(taskId);
                if (foundTask) {
                    displayTasks([foundTask]);
                } else {
                    printMessage(`Task with ID "${taskId}" not found.`, 'warning');
                }
                break;

            case 'update-task-status':
                const updateId = args[1];
                const newStatus = args[2] as TaskStatus;
                 if (!updateId || !newStatus) {
                    printMessage('Task ID and new status are required for update-task-status.', 'error');
                    break;
                }
                if (!Object.values(TaskStatus).includes(newStatus)) {
                    printMessage(`Invalid status: ${newStatus}. Valid statuses are: ${Object.values(TaskStatus).join(', ')}`, 'error');
                    break;
                }
                const updatedTask = await taskManager.updateTask(updateId, { status: newStatus });
                if (updatedTask) {
                    printMessage(`Task "${updatedTask.title}" status updated to ${newStatus}.`, 'success');
                } else {
                    printMessage(`Task with ID "${updateId}" not found for update.`, 'warning');
                }
                break;

            case 'delete-task':
                const deleteId = args[1];
                 if (!deleteId) {
                    printMessage('Task ID is required for delete-task.', 'error');
                    break;
                }
                const deleted = await taskManager.deleteTask(deleteId);
                if (deleted) {
                    printMessage(`Task with ID "${deleteId}" deleted.`, 'success');
                } else {
                    printMessage(`Task with ID "${deleteId}" not found or already deleted.`, 'warning');
                }
                break;

            case 'add-user':
                const userName = args[1];
                if (!userName) {
                    printMessage('User name is required.', 'error');
                    break;
                }
                const newUser = await taskManager.addUser(userName, args[2]);
                printMessage(`User "${newUser.name}" added with ID: ${newUser.id}`, 'success');
                break;

            case 'list-users':
                const users = taskManager.getAllUsers();
                displayUsers(users);
                break;
            
            case 'assign-task':
                const assignTaskId = args[1];
                const assignUserId = args[2];
                if (!assignTaskId || !assignUserId) {
                    printMessage('Task ID and User ID are required for assign-task.', 'error');
                    break;
                }
                const assignedTask = await taskManager.assignTaskToUser(assignTaskId, assignUserId);
                if (assignedTask) {
                    printMessage(`Task "${assignedTask.title}" assigned to user ID "${assignUserId}".`, 'success');
                } else {
                    printMessage(`Could not assign task. Task ID "${assignTaskId}" or User ID "${assignUserId}" not found.`, 'warning');
                }
                break;

            default:
                printMessage('Unknown command. Available commands: add-task, list-tasks, get-task, update-task-status, delete-task, add-user, list-users, assign-task', 'error');
                console.log('Usage:');
                console.log('  add-task <title> [description] [priority] [dueDate YYYY-MM-DD] [assigneeId]');
                console.log('  list-tasks');
                console.log('  get-task <taskId>');
                console.log('  update-task-status <taskId> <NEW_STATUS (TO_DO|IN_PROGRESS|DONE|CANCELLED)>');
                console.log('  delete-task <taskId>');
                console.log('  add-user <name> [email]');
                console.log('  list-users');
                console.log('  assign-task <taskId> <userId>');
        }
    } catch (error) {
        if (error instanceof Error) {
            printMessage(`An error occurred: ${error.message}`, 'error');
        } else {
            printMessage('An unknown error occurred.', 'error');
        }
    }
}

main();