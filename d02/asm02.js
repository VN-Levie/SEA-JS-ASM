// Bài tập: Tổ chức đội thi đấu

// Một đội vận động viên có 40 người:
// - 1 người là thành viên chủ lực 
// - 5 người là đội nòng cốt 
// - 5 người là đội dự bị 
// - 29 người còn lại là thành viên thường

// Yêu cầu:
// 1. Tìm tất cả các cách chọn 3 người thỏa mãn:
//    - Bắt buộc phải có thành viên chủ lực
//    - Phải có ít nhất 1 người từ đội nòng cốt
//    - Người còn lại phải là người từ đội dự bị

// 2. Các ràng buộc bổ sung:
//    - Trong đội có những cặp bài trùng HLV muốn những người này phải chơi cùng nhau, nhưng có những cặp thì không thể chơi cùng nhau nên ko thể ghép vào 1 đội.
//    - thêm những ràng buộc này trong quá trình chọn đội. 
//    - HLV có thể thay đổi những điều kiện này trước khi sắp xếp đội hình
const readline = require("readline");

const Roles = {
    MAIN: 'main',
    CORE_TEAM: 'core_team',
    SUBSTITUTE: 'substitute',
    NORMAL: 'normal',
};

class Athlete {
    constructor(name, role = Roles.NORMAL) {
        this.name = name;
        this.role = role;
    }
    toString() {
        return `${this.name} (${this.role.toUpperCase()})`;
    }
}

let athletes = [];
let mustTogetherPairs = new Set();
let mustSeparatePairs = new Set();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function createKey(a, b) {
    return [a, b].sort().join("-");
}

function findAthlete(name) {
    return athletes.find(a => a.name === name);
}


function logSuccess(message) {
    console.log(`[SUCCESS] ${message}`);
}

function logError(message) {
    console.log(`[ERROR] ${message}`);
}

function logInfo(message) {
    console.log(`[INFO] ${message}`);
}

function logWarning(message) {
    console.log(`[WARNING] ${message}`);
}

function printSectionSeparator() {
    console.log("---------------------------------------------");
}

function printSubSectionSeparator() {
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
}


function initAthletesAndConstraints() {
    athletes = [];
    athletes.push(new Athlete("A1", Roles.MAIN));
    for (let i = 1; i <= 5; i++) athletes.push(new Athlete(`C${i}`, Roles.CORE_TEAM));
    for (let i = 1; i <= 5; i++) athletes.push(new Athlete(`S${i}`, Roles.SUBSTITUTE));
    for (let i = 1; i <= 29; i++) athletes.push(new Athlete(`N${i}`, Roles.NORMAL));
    mustTogetherPairs.clear();
    mustSeparatePairs.clear();
    logSuccess("Athlete list reset to default and all pair constraints cleared.");
}


function setAthleteRoleLogic(name, newRole) {
    const targetAthlete = findAthlete(name);
    if (!targetAthlete) {
        return { success: false, message: `Athlete named "${name}" not found.` };
    }

    if (newRole === Roles.MAIN) {
        if (targetAthlete.role === Roles.MAIN) {
            return { success: true, message: `${name} is already ${Roles.MAIN.toUpperCase()}.` };
        }
        const currentMainAthlete = athletes.find(a => a.role === Roles.MAIN);
        if (currentMainAthlete && currentMainAthlete !== targetAthlete) {
            currentMainAthlete.role = Roles.NORMAL;
        }
        targetAthlete.role = Roles.MAIN;
        let message = `Assigned ${Roles.MAIN.toUpperCase()} to ${targetAthlete.name}.`;
        if (currentMainAthlete && currentMainAthlete !== targetAthlete) {
            message += ` ${currentMainAthlete.name} is no longer ${Roles.MAIN.toUpperCase()} (now ${Roles.NORMAL.toUpperCase()}).`;
        }
        return { success: true, message: message.trim() };
    } else if (targetAthlete.role === Roles.MAIN && newRole !== Roles.MAIN) {
        return { success: false, message: `Cannot directly change role of ${name} (currently ${Roles.MAIN.toUpperCase()}) to ${newRole.toUpperCase()}. To change ${Roles.MAIN.toUpperCase()}, assign another athlete as ${Roles.MAIN.toUpperCase()} first.` };
    } else {
        if (targetAthlete.role === newRole) {
            return { success: true, message: `${name} already has role ${newRole.toUpperCase()}.` };
        }
        targetAthlete.role = newRole;
        return { success: true, message: `Assigned ${newRole.toUpperCase()} to ${name}.` };
    }
}

function addPairToSetLogic(set, aName, bName, oppositeSet) {
    if (!findAthlete(aName) || !findAthlete(bName)) {
        return { success: false, message: "One or both athlete names do not exist." };
    }
    if (aName === bName) {
        return { success: false, message: "Cannot create a pair with the same person." };
    }
    const key = createKey(aName, bName);
    if (set.has(key)) return { success: false, message: `Pair [${aName}, ${bName}] already exists in this list.` };
    if (oppositeSet.has(key)) return { success: false, message: `Conflict: pair [${aName}, ${bName}] is in the opposite list.` };
    set.add(key);
    return { success: true, message: `Added pair [${aName}, ${bName}].` };
}

function removePairFromSetLogic(set, aName, bName) {
    if (!findAthlete(aName) || !findAthlete(bName)) {
        return { success: false, message: "One or both athlete names do not exist to remove from pair." };
    }
    if (aName === bName) {
        return { success: false, message: "Invalid athlete name for removal." };
    }
    const key = createKey(aName, bName);
    if (set.has(key)) {
        set.delete(key);
        return { success: true, message: `Removed pair [${aName}, ${bName}].` };
    }
    return { success: false, message: `Pair [${aName}, ${bName}] does not exist for removal.` };
}

function checkMustTogether(team) {
    const names = team.map(p => p.name);
    for (const pair of mustTogetherPairs) {
        const [a, b] = pair.split("-");
        const hasA = names.includes(a);
        const hasB = names.includes(b);
        if ((hasA && !hasB) || (!hasA && hasB)) return false;
    }
    return true;
}

function checkMustSeparate(team) {
    const names = team.map(p => p.name);
    for (const pair of mustSeparatePairs) {
        const [a, b] = pair.split("-");
        if (names.includes(a) && names.includes(b)) return false;
    }
    return true;
}

function generateValidTeamsLogic() {
    const main = athletes.find(p => p.role === Roles.MAIN);
    if (!main) {
        return { success: false, teams: [], message: `CRITICAL: No ${Roles.MAIN.toUpperCase()} athlete assigned. Cannot create teams.` };
    }
    const coreList = athletes.filter(p => p.role === Roles.CORE_TEAM);
    const subList = athletes.filter(p => p.role === Roles.SUBSTITUTE);

    if (coreList.length === 0) {
        return { success: false, teams: [], message: `CRITICAL: No ${Roles.CORE_TEAM.toUpperCase()} athletes. Cannot create teams.` };
    }
    if (subList.length === 0) {
        return { success: false, teams: [], message: `CRITICAL: No ${Roles.SUBSTITUTE.toUpperCase()} athletes. Cannot create teams.` };
    }

    const result = [];
    for (const core of coreList) {
        for (const sub of subList) {
            if (main.name === core.name || main.name === sub.name || core.name === sub.name) {
                continue;
            }
            const team = [main, core, sub];
            if (checkMustTogether(team) && checkMustSeparate(team)) {
                result.push(team);
            }
        }
    }
    return { success: true, teams: result, message: `Found ${result.length} valid team combinations.` };
}



function handleGenerateTeams(callback) {
    console.log("\n>> Generating Teams <<");
    printSubSectionSeparator();
    const result = generateValidTeamsLogic();

    if (!result.success) {
        logError(result.message);
    } else {
        if (result.teams.length === 0) {
            logWarning("No valid team combinations found with current criteria and constraints.");
        } else {
            logSuccess(`Found ${result.teams.length} valid team combinations:`);
            result.teams.forEach((team, index) => {
                const teamString = team.map(p => p.toString()).join(" | ");
                console.log(`  Team ${index + 1}: ${teamString}`);
            });
        }
    }
    printSectionSeparator();
    callback();
}

function handleShowAllAthletes(callback) {
    console.log("\n>> Athlete Roster <<");
    printSubSectionSeparator();
    const grouped = {
        [Roles.MAIN.toUpperCase()]: [],
        [Roles.CORE_TEAM.toUpperCase()]: [],
        [Roles.SUBSTITUTE.toUpperCase()]: [],
        [Roles.NORMAL.toUpperCase()]: [],
    };

    athletes.sort((a, b) => a.name.localeCompare(b.name));

    for (const a of athletes) grouped[a.role.toUpperCase()].push(a.name);

    const displayRole = (roleName, athletesInRole) => {
        const roleDisplayName = roleName.replace('_', ' ');
        let output = `${roleDisplayName}: `;
        if (athletesInRole.length === 0) {
            output += `(None)`;
        } else {
            output += athletesInRole.join(', ');
        }
        console.log(`  * ${output}`);
    };

    displayRole(Roles.MAIN.toUpperCase(), grouped[Roles.MAIN.toUpperCase()]);
    displayRole(Roles.CORE_TEAM.toUpperCase(), grouped[Roles.CORE_TEAM.toUpperCase()]);
    displayRole(Roles.SUBSTITUTE.toUpperCase(), grouped[Roles.SUBSTITUTE.toUpperCase()]);
    displayRole(Roles.NORMAL.toUpperCase(), grouped[Roles.NORMAL.toUpperCase()]);

    printSectionSeparator();
    if (callback) {
        callback();
    }

}

function handleResetData(callback) {
    console.log("\n>> Resetting Data <<");
    printSubSectionSeparator();
    initAthletesAndConstraints();
    printSectionSeparator();
    callback();
}

function handleSetAthleteRole(menuCallback) {
    let athleteToChange = null;

    console.log("\n>> Assign Role to Athlete (type !q to return) <<");
    handleShowAllAthletes();
    printSubSectionSeparator();

    function askAthleteName() {
        rl.question("Enter athlete's name to assign role: ", (nameInput) => {
            const name = nameInput.trim();
            if (name === "!q") {
                logInfo("Exiting role assignment.");
                printSectionSeparator();
                menuCallback();
                return;
            }
            if (!name) {
                logError("Athlete name cannot be empty. Please try again.");
                askAthleteName();
                return;
            }
            const foundAthlete = findAthlete(name);
            if (!foundAthlete) {
                logError(`Athlete named "${name}" not found. Please try again.`);
                askAthleteName();
                return;
            }
            athleteToChange = foundAthlete;
            logInfo(`Athlete: ${athleteToChange.name}, Current role: ${athleteToChange.role.toUpperCase()}`);
            askNewRole();
        });
    }

    function askNewRole() {
        rl.question("Assign new role ([m]ain, [c]ore, [s]ub, [n]ormal): ", (roleInput) => {
            let targetRole;
            const roleCleaned = roleInput.toLowerCase().trim();
            if (roleCleaned === "!q") {
                logInfo("Exiting role assignment.");
                printSectionSeparator();
                menuCallback();
                return;
            }
            switch (roleCleaned) {
                case "m": case "main": targetRole = Roles.MAIN; break;
                case "c": case "core": case "core_team": targetRole = Roles.CORE_TEAM; break;
                case "s": case "sub": case "substitute": targetRole = Roles.SUBSTITUTE; break;
                case "n": case "normal": targetRole = Roles.NORMAL; break;
                default:
                    logError("Invalid role selected. Please use 'm', 'c', 's', or 'n', or the full role name.");
                    askNewRole();
                    return;
            }


            const result = setAthleteRoleLogic(athleteToChange.name, targetRole);
            if (result.success) {
                logSuccess(result.message);
            } else {
                logError(result.message);
            }
            printSectionSeparator();
            menuCallback();
        });
    }

    askAthleteName();
}

function handleAddPair(type, menuCallback) {
    const pairTypeDisplay = type === 'together' ? "MUST BE TOGETHER" : "MUST NOT BE TOGETHER";
    const set = type === 'together' ? mustTogetherPairs : mustSeparatePairs;
    const oppositeSet = type === 'together' ? mustSeparatePairs : mustTogetherPairs;

    let athleteName1 = null;
    let athleteName2 = null;

    console.log(`\n>> Add ${pairTypeDisplay} Pair (type !q to return) <<`);
    printSubSectionSeparator();

    function askFirstName() {
        rl.question("Enter name of first athlete: ", (nameInput) => {
            const name = nameInput.trim();

            if (!name) {
                logError("Athlete name cannot be empty.");
                askFirstName();
                return;
            }
            if (name === "!q") {
                logInfo("Exiting pair addition.");
                printSectionSeparator();
                menuCallback();
                return;
            }
            if (!findAthlete(name)) {
                logError(`Athlete named "${name}" not found. Please try again.`);
                askFirstName();
                return;
            }
            athleteName1 = name;
            askSecondName();
        });
    }

    function askSecondName() {
        rl.question(`Enter name of second athlete (must be different from ${athleteName1}): `, (nameInput) => {
            const name = nameInput.trim();
            if (!name) {
                logError("Athlete name cannot be empty.");
                askSecondName();
                return;
            }
            if (name === "!q") {
                logInfo("Exiting pair addition.");
                printSectionSeparator();
                menuCallback();
                return;
            }
            if (!findAthlete(name)) {
                logError(`Athlete named "${name}" not found. Please try again.`);
                askSecondName();
                return;
            }
            if (name === athleteName1) {
                logError(`Second athlete cannot be the same as the first one ("${athleteName1}"). Please enter a different name.`);
                askSecondName();
                return;
            }
            athleteName2 = name;
            processPairAddition();
        });
    }

    function processPairAddition() {
        const result = addPairToSetLogic(set, athleteName1, athleteName2, oppositeSet);
        if (result.success) {
            logSuccess(result.message);
        } else {
            logError(result.message);
        }
        printSectionSeparator();
        menuCallback();
    }

    askFirstName();
}


function handleRemovePair(type, menuCallback) {
    const pairTypeDisplay = type === 'together' ? "MUST BE TOGETHER" : "MUST NOT BE TOGETHER";
    const set = type === 'together' ? mustTogetherPairs : mustSeparatePairs;

    let athleteName1 = null;
    let athleteName2 = null;

    console.log(`\n>> Remove ${pairTypeDisplay} Pair (type !q to return) <<`);
    printSubSectionSeparator();

    function askFirstName() {
        rl.question("Enter name of first athlete in pair to remove: ", (nameInput) => {
            const name = nameInput.trim();
            if (!name) {
                logError("Athlete name cannot be empty.");
                askFirstName();
                return;
            }
            if (name === "!q") {
                logInfo("Exiting pair removal.");
                printSectionSeparator();
                menuCallback();
                return;
            }
            if (!findAthlete(name)) {
                logError(`Athlete named "${name}" not found. Please try again.`);
                askFirstName();
                return;
            }
            athleteName1 = name;
            askSecondName();
        });
    }

    function askSecondName() {
        rl.question(`Enter name of second athlete in pair to remove (must be different from ${athleteName1}): `, (nameInput) => {
            const name = nameInput.trim();
            if (!name) {
                logError("Athlete name cannot be empty.");
                askSecondName();
                return;
            }
            if (name === "!q") {
                logInfo("Exiting pair removal.");
                printSectionSeparator();
                menuCallback();
                return;
            }
            if (!findAthlete(name)) {
                logError(`Athlete named "${name}" not found. Please try again.`);
                askSecondName();
                return;
            }
            if (name === athleteName1) {
                logError(`Second athlete cannot be the same as the first one ("${athleteName1}") for removal. Please enter a different name.`);
                askSecondName();
                return;
            }
            athleteName2 = name;
            processPairRemoval();
        });
    }

    function processPairRemoval() {
        const result = removePairFromSetLogic(set, athleteName1, athleteName2);
        if (result.success) {
            logSuccess(result.message);
        } else {
            logError(result.message);
        }
        printSectionSeparator();
        menuCallback();
    }

    askFirstName();
}
function handleShowConstraints(callback) {
    console.log("\n>> Constraint Pairs <<");
    printSubSectionSeparator();

    console.log("MUST BE TOGETHER pairs:");
    if (mustTogetherPairs.size === 0) {
        console.log("  (No 'must be together' pairs defined)");
    } else {
        mustTogetherPairs.forEach(pair => console.log(`  - ${pair.split('-').join(' <-> ')}`));
    }

    console.log("\nMUST NOT BE TOGETHER pairs:");
    if (mustSeparatePairs.size === 0) {
        console.log("  (No 'must not be together' pairs defined)");
    } else {
        mustSeparatePairs.forEach(pair => console.log(`  - ${pair.split('-').join(' <!> ')}`));
    }
    printSectionSeparator();
    callback();
}

function handleExit() {
    logInfo("Exiting Team Management Program. Goodbye!");
    rl.close();
}


function showMenu() {
    console.log("\n#############################################");
    console.log("#        TEAM FORMATION ASSISTANT         #");
    console.log("#############################################");
    console.log("Please select an option:");
    console.log("  [0] Generate 3-person team (Main, Core, Sub)");
    console.log("  [1] Show Athlete Roster");
    console.log("  [2] Reset Athlete List & Constraints (Default)");
    console.log("  [3] Assign Role to Athlete");
    console.log("  [4] Add 'MUST BE TOGETHER' Pair");
    console.log("  [5] Add 'MUST NOT BE TOGETHER' Pair");
    console.log("  [6] Remove 'MUST BE TOGETHER' Pair");
    console.log("  [7] Remove 'MUST NOT BE TOGETHER' Pair");
    console.log("  [8] Show All Constraint Pairs");
    console.log("  [9] Exit Program");
    console.log("=============================================");

    rl.question("Enter your choice (0-9): ", (choice) => {
        switch (choice.trim()) {
            case "0": handleGenerateTeams(showMenu); break;
            case "1": handleShowAllAthletes(showMenu); break;
            case "2": handleResetData(showMenu); break;
            case "3": handleSetAthleteRole(showMenu); break;
            case "4": handleAddPair('together', showMenu); break;
            case "5": handleAddPair('separate', showMenu); break;
            case "6": handleRemovePair('together', showMenu); break;
            case "7": handleRemovePair('separate', showMenu); break;
            case "8": handleShowConstraints(showMenu); break;
            case "9": handleExit(); break;
            default:
                logError("Invalid choice. Please select a number from 0 to 9.");
                showMenu();
                break;
        }
    });
}

// Start the program
initAthletesAndConstraints(); // Initialize initial data
showMenu(); // Display the menu for the first time