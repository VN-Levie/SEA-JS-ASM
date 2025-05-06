// Tính tử số: n * (n-1) * ... * (n-k+1)
function partialFactorial(n, k) {
    let result = 1;
    for (let i = 0; i < k; i++) {
        result *= (n - i);
    }
    return result;
}

// Tính giai thừa thường
function factorial(x) {
    let result = 1;
    for (let i = 2; i <= x; i++) {
        result *= i;
    }
    return result;
}

// tính tổ hợp C(n, k)
// C(n, k) = n! / (k! * (n-k)!)
function combination(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;

    const numerator = partialFactorial(n, k);
    const denominator = factorial(k);

    return numerator / denominator;
}

function rdInRand(min, max){

    let rd = Math.floor(Math.random() * (max - min + 1)) + min;
    return rd;
}


function randomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}

function findMissingElement(arr1, arr2){
    var result = [];
    arr1.forEach(e => {
        var found = false;
        for (let i = 0; i < arr2.length; i++) {
            const e2 = arr2[i];
            if(e == e2){
                found = true;
                break;
            }
        }
        if(!found){
            result.push(e);
        }
    });
    return result;
}

//test
console.log("combination (5, 3): " + combination(5, 3)); // 10
console.log(combination(5, 3)); // 10
var min = 1;
var max = 10;
console.log("random number in range (" + min + ", " + max + "): " + rdInRand(min, max)); // 1-10
var arr = [1, 2, 3, 4, 5];
console.log("get random element from array: " + arr + " = " + randomElement(arr)); // 1-5
var arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var arr2 = [1, 2, 3, 4, 5];
console.log("find missing element in array: " + arr1 + " - " + arr2);
var result = findMissingElement(arr1, arr2);
console.log("result: " + result); // 6-10
//cmd: node asm02.js