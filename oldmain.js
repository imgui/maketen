let numString = '2715';
let guessCount = 0;
let inputs = '';
let display = [document.querySelector('.first'),
document.querySelector('.second'),
document.querySelector('.third'),
document.querySelector('.fourth'),
document.querySelector('.fifth'),
document.querySelector('.sixth')]
initialise();

function initialise() {
        const displayLines = document.querySelectorAll('.displayLines p');
    for (const line of displayLines) {
        line.style.backgroundColor = '#ededed';
    }
    update();
}

function addOperator(op) {
    if (inputs.charAt(0) === '~') {
        inputs = op;
        update();
        return;
    }
    inputs += op;
    update();
}

function guess() {
    let str = formatExpr(inputs);
    const result = eval(str);
    display[guessCount].textContent = display[guessCount].textContent + ` = ${result}`;
    if (result === 10) {
        display[guessCount].style.backgroundColor = 'lightGreen';
    }

    guessCount++;
    inputs = '~';

    update();
    display[guessCount].style.backgroundColor = 'lightGray';
}

function update() {
    display[guessCount].textContent = inputs;
    display[guessCount].style.backgroundColor = 'lightGray';

    const qmarkCount = (inputs.match(/\?/g) || []).length;
    if (qmarkCount >= 4) {
        questionButt.disabled = true;

        let exception = false;
        try {
            let expr = formatExpr(inputs);
            const result = eval(expr);
        }
        catch {
            exception = true;
        }
        if (exception) {
            equalsButt.disabled = true;
        } else {
            equalsButt.disabled = false;
        }
        
    } else {
        questionButt.disabled = false;
        equalsButt.disabled = true;
    }

    if (inputs.length == 0) {
        backButt.disabled = true;
    } else {
        backButt.disabled = false;
    }
}
// 
// Given a numString, returns array of all correct guesses
// No prefix, only three 'slots'
function correctGuesses(numString) {
    const operators = ['+', '-', '*', '/', '**', ''];
    const permutations = findPerms(numString);
    let arr = [];

    // For each permutation
    for (let i = 0; i < permutations.length; i++) {
        let perm = permutations[i];
        operationCombos = operators.length**3;

        for (let ii = 0; ii < operationCombos; ii++) {
            let len = operators.length;
            let firstOp = operators[~~(ii%len)];
            let secondOp = operators[~~((ii/len)%len)];
            let thirdOp = operators[~~((ii/(len**2))%len)];

            let expression = perm[0] + firstOp + 
                             perm[1] + secondOp +
                             perm[2] + thirdOp +
                             perm[3];

            leadingZeros = /0\d/.test(expression);
            if (eval(expression) === 10 && !leadingZeros) {
                arr.push(expression);
            }
        }
    }
    arr = [...new Set(arr)]; //remove duplicates

    // Convert strings to sum of products arrays, discard +'s, evaluate elements
    // that result in 0.
    sops = [];
    for (let i = 0; i < arr.length; i++) {
        str = arr[i];
        sop = str.replaceAll('-', '+-').split('+');

        for (let ii = 0; ii < sop.length; ii++) {
            // Parse the str, because eg. -0**1 will give errors
            validStr = sop[ii];
            if (validStr[0] === '-' && validStr.includes('**')) {
                validStr = validStr.slice(1);
            }

            if (eval(validStr) === 0) {
                sop[ii] = '0';
            }
        }
        sops.push(sop);
    }

    // Group permutations into sub arrays
    finalArr = [];
    for (let i = 0; i < sops.length; i++) {
        const sop = sops[i];
        if (finalArr.length === 0) {
            let allSops = sopPermute(sop);
            if(!arraysEqual(allSops, sop)) {
                console.log(allSops, sop);
                for (let thisSop in allSops) {
                    finalArr.push(permute(thisSop));
                }
            } else {
                finalArr.push(permute(sop));
            }
        } else {
            // Check if it does not exist in the subarrays
            exists = false;
            for (let ii = 0; ii < finalArr.length; ii++) {
                const subArr = finalArr[ii];
                for (let iii = 0; iii < subArr.length; iii++) {
                    const existingSop = subArr[iii];

                    if (arraysEqual(sop, existingSop)) {
                        exists = true;
                        break
                    }
                }
                if (exists === true) {
                    break;
                }
            }
            if (exists === false) {
                let allSops = sopPermute(sop);
                if(!arraysEqual(allSops, sop)) {
                    console.log(allSops, sop);
                    for (let thisSop in allSops) {
                        finalArr.push(permute(thisSop));
                    }
                } else {
                finalArr.push(permute(sop));
                }
            }
        }
    }

    return finalArr;;
}
// https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }



  // Takes array, break each product into array of products (ignoring divisions
  // and exponents). Permute each one, return an array of all the valid perms.
  // ie 8**1*2 - 6, 2*8**1 - 6 || 2*4/4+8 , 4/4*2+8 || 7+3*1*1, 7+1*3*1, 7+1*1*3
  function sopPermute(sop) {
    let result = [];
    for (let i = 0; i < sop.length; i++) {
        let products = sop[i];
        let productsArr = products.replaceAll('**','^').split('*'); // ie [8^1, 2]
        for (let ii = 0; ii < productsArr.length; ii++) {
            productsArr[ii] = productsArr[ii].replaceAll('^', '**');
        } // ie [8**1, 2];

        let newProducts = permute(productsArr);
        for (let ii = 0; ii < newProducts.length; ii++) {
            if (newProducts.length === 1) {
                break;
            }
            // Return to string
            let productStr = newProducts[ii].join('*'); // ie 8**1*2
            // Generate a new sop
            let newSop = [...sop];
            newSop[i] = productStr;
            //console.log('newSop =' + newSop, 'ii = ' + ii, ' productStr = ' + productStr);
            result.push(newSop);
            //console.log(result);
        }
    }
    if (result.length === 0) {
        return sop;
    }
    return result;
  }

  //https://medium.com/weekly-webtips/step-by-step-guide-to-array-permutation-using-recursion-in-javascript-4e76188b88ff
  function permute(nums) {
    let result = [];
  if (nums.length === 0) return [];
    if (nums.length === 1) return [nums];
  for (let i = 0; i < nums.length; i++) {
      const currentNum = nums[i];
      const remainingNums = nums.slice(0, i).concat(nums.slice(i + 1));
      const remainingNumsPermuted = permute(remainingNums);
    for (let j = 0; j < remainingNumsPermuted.length; j++) {
        const permutedArray = [currentNum].concat(remainingNumsPermuted[j]);
        result.push(permutedArray);
      }
    }
    return result;
  }
    

function formatExpr(str) {
    // Add asterisks between ?? and )(

    while (str.indexOf('\?\?') != -1) {
       str = strSplice(str, str.indexOf('\?\?') + 1, '*');
    }

    while(str.indexOf("\)\(") != -1) {
        str = strSplice(str, str.indexOf('\)\(') + 1, '*');
    }

    for (let i = 0; i < 4; i++) {
        str = str.replace('?', numString[i]);
    }
    return str;
}

function strSplice(str, idx, graft) {
    return str.slice(0, idx) + graft + str.slice(idx, str.length);
}

function countGuesses() {
let counter = 0;
for (let i = 1000; i <= 9999; i++) {
    if (correctGuesses(String(i)).length >= 1) {
        counter++;
        console.log(counter);
    }
}
console.log('done');
}