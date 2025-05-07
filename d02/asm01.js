// Student Management System Assignment Requirements
// Build A Student Management Application With The Following Features:
// 1.Store Student Information (Id, Name, Age, Grade)
// 2.Display The List Of Students
// 3.Add New Students To The List
// 4.Search For Students By Name
// 5.Display Statistics:
//  - Total Number Of Students
//  - Average Grade Of All Students
//  - Number Of Students By Classification: Excellent (≥ 8), Good (≥ 6.5), Average (< 6.5)
// 6.Save The Student List To A File (JSON)
// 7.Load The Student List From File On Startup
// The Application Should Have A Command-Line Interface That Allows Users To Select Functions Through An Interactive Menu.
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

var Student = function (id, name, age, grade) {
    this.id = id;
    this.name = name;
    this.age = age;
    this.grade = grade;
}

var students = [];
var fs = require('fs');
var fileName = 'students.json';
const menu = `
╔════════════════════════════════════════╗
║        STUDENT MANAGEMENT MENU         ║
╠════════════════════════════════════════╣
║ 1. Add Student                         ║
║ 2. Display Students                    ║
║ 3. Search Student                      ║
║ 4. Display Statistics                  ║
║ 5. Save Students                       ║
║ 6. Load Students                       ║
║ 7. Exit                                ║
╚════════════════════════════════════════╝
`;

function displayMenu() {
    console.log("\n-----------------------------");
    console.log(menu);
    // readline.clearLine(process.stdout, 0);
    // console.clear();
    rl.question("🟡 Enter your choice (1–7): ", function (choice) {
        choice = choice.trim();
        console.log();
        // console.log("You selected: " + choice);
        switch (choice) {
            case '1':
                addStudent(displayMenu);
                break;
            case '2':
                displayStudents(displayMenu);
                break;
            case '3':
                searchStudent(displayMenu);
                break;
            case '4':
                displayStatistics(displayMenu);
                break;
            case '5':
                saveStudents(displayMenu);
                break;
            case '6':
                loadStudents(displayMenu);
                break;
            case '7':
                exitApp();
                // console.log("Exiting the application...");
                // rl.close();
                break;
            default:
                console.log("Invalid choice. Please try again.");
                displayMenu();
        }


    });
}

function exitApp() {
    rl.question("Do you want to save before exiting? (y/n): ", function (answer) {
        if (answer.toLowerCase() === 'y') {
            saveStudents(function () {
                console.log("Exiting the application...");
                rl.close();
            });
        } else {
            console.log("Exiting the application without saving...");
            rl.close();
        }
    });
}

function addStudent(callback) {
    let id, name, age, grade;

    function askId() {
        rl.question("Enter student ID: ", function (input) {
            while (true) {
                if (!input.trim()) {
                    console.log("❌ ID cannot be empty.");
                } else if (students.some(s => s.id === input)) {
                    console.log("❌ ID already exists. Please enter a unique ID.");
                } else {
                    id = input;
                    break;
                }
                return askId();
            }
            askName();
        });
    }

    function askName() {
        rl.question("Enter student name: ", function (input) {
            while (true) {
                if (!input.trim()) {
                    console.log("\n❌ Name cannot be empty.");
                } else {
                    name = input.trim();
                    break;
                }
                return askName();
            }
            askAge();
        });
    }

    function askAge() {
        rl.question("Enter student age: ", function (input) {
            while (true) {
                let n = parseInt(input);
                if (isNaN(n) || n <= 0) {
                    console.log("\n❌ Age must be a positive integer.");
                } else {
                    age = n;
                    break;
                }
                return askAge();
            }
            askGrade();
        });
    }

    function askGrade() {
        rl.question("Enter student grade (0-10): ", function (input) {
            while (true) {
                let g = parseFloat(input);
                if (isNaN(g) || g < 0 || g > 10) {
                    console.log("\n❌ Grade must be a number between 0 and 10.");
                } else {
                    grade = g;
                    break;
                }
                return askGrade();
            }

            // All fields valid, create and save student
            var student = new Student(id, name, age, grade);
            students.push(student);
            console.log("\n✅ Student added successfully.");
            callback();
        });
    }

    askId();
}


function searchStudent(callback) {
    rl.question("Enter student name to search: ", function (name) {
        //check empty
        if (!name.trim()) {
            console.log("\n❌ Name cannot be empty.");
            return searchStudent(callback);
        }
        var foundStudents = students.filter(function (student) {
            return student.name.toLowerCase().includes(name.toLowerCase());
        });
        if (foundStudents.length === 0) {
            console.log("\nNo students found with the name: " + name);
            callback();
        } else {
            console.log("\nSearch Results:");
            console.log("-------------------------------");
            foundStudents.forEach(function (student) {
                console.log("ID: " + student.id + ", Name: " + student.name + ", Age: " + student.age + ", Grade: " + student.grade);
            });
            console.log("-------------------------------");
            console.log("Total Students Found: " + foundStudents.length);
            callback();
        }
    });

}

function displayStudents(callback) {
    if (students.length === 0) {
        console.log("\nNo students found.");
        return callback();;
    }
    console.log("Student List:");
    console.log("-------------------------------");
    // console.log("ID\tName\tAge\tGrade");
    students.forEach(function (student) {
        console.log("ID: " + student.id + ", Name: " + student.name + ", Age: " + student.age + ", Grade: " + student.grade);
        // console.log(student.id + "\t" + student.name + "\t" + student.age + "\t" + student.grade);
    });
    console.log("-------------------------------");
    console.log("Total Students: " + students.length);
    callback();
}


function displayStatistics(callback) {
    if (students.length === 0) {
        console.log("\nNo students found.");
        return;
    }
    var totalStudents = students.length;
    var totalGrade = students.reduce(function (sum, student) {
        return sum + parseFloat(student.grade);
    }, 0);
    var averageGrade = totalGrade / totalStudents;
    var excellentCount = students.filter(function (student) {
        return student.grade >= 8;
    }).length;
    var goodCount = students.filter(function (student) {
        return student.grade >= 6.5 && student.grade < 8;
    }).length;
    var averageCount = students.filter(function (student) {
        return student.grade < 6.5;
    }).length;

    console.log("Total Students: " + totalStudents);
    console.log("Average Grade: " + averageGrade.toFixed(2));
    console.log("Excellent Students: " + excellentCount);
    console.log("Good Students: " + goodCount);
    console.log("Average Students: " + averageCount);
    console.log();
    callback();
}
function saveStudents(callback) {
    fs.writeFile(fileName, JSON.stringify(students), function (err) {
        if (err) {
            console.log("\nError saving students: " + err);
            callback();
        } else {
            console.log("\nStudents saved successfully.");
            callback();
        }
    });

}

function loadStudents(callback) {
    fs.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
            console.log("\n❌ Error loading students: " + err.message);
            return displayMenu();
        }

        try {
            const parsed = JSON.parse(data);

            if (!Array.isArray(parsed)) {
                // throw new Error("Data format invalid: expected an array.");
                console.log("\n❌ Data format invalid: expected an array.");
                return displayMenu();
            }


            students = parsed;
            if (students.length === 0) {
                console.log("\n❌ No students found in the file.");
                return displayMenu();
            }
            console.log("\n✅ Students loaded successfully.");
            displayStudents(callback);
        } catch (e) {
            console.log("\n❌ Failed to parse student data: " + e.message);
            callback();
        }
    });
}

// Start the application
loadStudents(displayMenu);