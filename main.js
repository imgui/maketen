let numberDisplay = document.getElementById('number');
let inputField = document.getElementById('input');
let messageField = document.getElementById('message');
let dynamicColumn = document.getElementById('dynamicColumn');

let number = '';
let remainingSolutions = [];
let correctGuesses = [];

while (remainingSolutions.length == 0) {
    number = String(Math.floor(Math.random()*10000)).padStart(4,0);
    remainingSolutions = findSolutions(number);
}

numberDisplay.textContent = number;
inputField.focus();
inputField.add

function solutionEntered(event) {
    if (event.keyCode !== 13) { messageField.textContent = ''; return; } // 'Enter' key
    let guess = orderExpression(inputField.value);
    let orderedCorrectGuesses = correctGuesses.map((ele) => orderExpression(ele));
    let result = 0;

    //TODO validate guess
    try {
        result = eval(guess);
    } catch (error) {
        messageField.textContent = 'Illegal guess';
        return;
    }

    if (result === 10 && orderedCorrectGuesses.includes(guess)) {
        messageField.textContent = 'Too similar to a previous guess';
    } else if (result !== 10) {
        messageField.textContent = 'Does not make ten';
    } else if (result === 10 && remainingSolutions.includes(guess)) {
        // Remove from remaining
        remainingSolutions = remainingSolutions.filter(function (value, index, arr) {
            return value !== guess;
        });
        correctGuesses.push(inputField.value.replaceAll(' ', ''));

        // Remove dynamic elements
        while(dynamicColumn.hasChildNodes()) {
            dynamicColumn.removeChild(dynamicColumn.firstChild);
        }

        // Add correct guess/es
        for (let i = 0; i < correctGuesses.length; i++) {
            let ele = document.createElement('div');
            ele.setAttribute('class', 'foundSolution');
            ele.textContent = correctGuesses[i];
            dynamicColumn.appendChild(ele);
        }

        // Add remaining guesses
        if (remainingSolutions.length === 0) {
            messageField.textContent = 'All solutions found!';
        } else {
            // Add field
            let ele = document.createElement('input');
            ele.setAttribute('id', 'input');
            ele.setAttribute('autocomplete', 'off');
            ele.setAttribute('onkeypress', 'solutionEntered(event)');
            dynamicColumn.appendChild(ele);
            inputField = document.getElementById('input');
            inputField.focus();

            for (let i = 0; i < remainingSolutions.length-1; i++) {
                let ele = document.createElement('div');
                ele.setAttribute('class', 'hiddenSolution');
                dynamicColumn.appendChild(ele);
            }
        }
    } else {
        console.log('Guess was correct but not anticipated by the program. Fix it!');
    }

}



// 715 combinations of digits (according to Tina (and eventually, me too))
// Interesting cases: 8121, 8253, 1010, 8111TODO+*bug, something to do with adding *1 on end?, 1099(has 22 solutions), 8674!, 2869, 5264, 8427, 6032!! (60/2/3) 2389 2368, 2345. 2245 2255
// Take a four digit numstring, return an array of all solution strings.
// SC: No consecutive exponents allowed. They are never fun. 
// ie 2810 -> {8+2*1+0, SCExponentZero, 
// Note that solutions are ordered, and there are special cases.
function findSolutions(numString) {
    const operators = ['+', '-', '*', '/', '**', ''];
    const permutations = findPerms(numString);
    let arr = [];

    const operationCombos = operators.length**3;
    const numberCombos = 10**numString.length;

    for (let i = 0; i < permutations.length; i++) {
        const perm = permutations[i];
        for (let ii = 0; ii < operationCombos; ii++) {
            let len = operators.length;
            let firstOp = operators[~~(ii%len)];
            let secondOp = operators[~~((ii/len)%len)];
            let thirdOp = operators[~~((ii/(len**2))%len)];

            const expression = perm[0] + firstOp + perm[1] + secondOp + perm[2] + thirdOp + perm[3];

            leadingZeros = /0\d/.test(expression);
            consecExponents = /\*\*\d\*\*/.test(expression);
            if (eval(expression) === 10 && !leadingZeros && !consecExponents) {
                arr.push(orderExpression(expression));
            }
        }      
    }

    arr = [... new Set(arr)]; // remove duplicates
    return arr;
}

// Takes an expression string, applies the following rules:
//    (most importantly the rules are consistent, if somewhat arbitrary)
//  #Factors are consistently ordered ascending by js sort() (divisors at end)
//  #Sums are consistently ordered descending by js sort()
//  TODO buggy SC: '/1' or '*1' becomes '*1' and always associates with the last term. ('1991')
//  #SC: -0 becomes +0
//  SC: 1^exp always uses the larger number as the exp (ie 1^54, not 1^45)
//  SC: num^0 always uses the larger number as the exp (ie 54^0, not 45^0)
//  SC: **1 goes on end
function orderExpression(expression) {
    let SCOneFactors = '';
    expression = expression.replaceAll(' ', '');
    let sums = (expression[0] + expression.slice(1).replaceAll('-', '+-')).split('+');
    //console.log('sums:' + sums);

    for (let i = 0; i < sums.length; i++) {
        const isOneDigit = sums[i].length == 1 || (sums[i][0] === '-' && sums[i].length === 2);
        if (isOneDigit) { sums[i] = deSignZero(sums[i]); continue; }
        
        let minusSign = null;
        if (sums[i][0] === '-') {
            sums[i] = sums[i].slice(1);
            minusSign = '-';
        }

        let factors = sums[i].replaceAll('**', '^').replaceAll('/', '*/').split('*');

        //console.log(factors);
        // Seperate divisors, remove '/1's
        let divisors = [];
        for (let ii = factors.length-1; ii >= 0; ii--) {
            if (factors[ii][0] == '/') {
                const divisor = factors.splice(ii, 1); //Remove divisor from arr
                divisors.push(divisor);
                if (divisor == '/1') { 
                    SCOneFactors += '*1';
                    divisors.pop();
                    //console.log('Expression ' + expression + 'Divisors ' + divisors);
                    //console.log('hiihi');
                }
            }
        }
        divisors = divisors.sort();
        //console.log('div:' + divisors);

        factors.sort();
        //console.log('factors: ' + factors);
        // Remove '*1's
        for (let ii = factors.length-1; ii >= 0; ii--) {
            if (factors[ii] == '1') {
                 factors.splice(ii, 1); 
                 SCOneFactors += '*1';
                 //console.log('sc: ' + SCOneFactors);
            }
        }
        sums[i] = factors.concat(divisors);
        sums[i] = sums[i].join('*').replaceAll('*/', '/');
        
        if (minusSign !== null) { sums[i] = '-' + sums[i]; }
        sums[i] = deSignZero(sums[i]);
    }
    //console.log(sums.sort());
    return sums.sort().reverse().join('+').replaceAll('^', '**').replaceAll('+-', '-') + SCOneFactors;

    function deSignZero (str) { return str.replaceAll('-0', '0');}
}

// Given a numbstring, return array of all permutations)
//https://medium.com/swlh/step-by-step-guide-to-solving-string-permutation-using-recursion-in-javascript-a11d098d5b83
function findPerms(str) {
    if (str.length === 0) return "";
    if (str.length === 1) return str;
    let result = [];
    for (let i = 0; i < str.length; i++) {
      const currentChar = str[i];
      const remainingChars = str.slice(0, i) + str.slice(i + 1);
      const remainingCharsPermuted = findPerms(remainingChars);
      for (let j = 0; j < remainingCharsPermuted.length; j++){
        const permutation = currentChar + remainingCharsPermuted[j]
        result.push(permutation)
      }
    }
    return (result);
  }

  /** Function that count occurrences of a substring in a string;
 * @param {String} string               The string
 * @param {String} subString            The sub string to search for
 * @param {Boolean} [allowOverlapping]  Optional. (Default:false)
 *
 * @author Vitim.us https://gist.github.com/victornpb/7736865
 * @see Unit Test https://jsfiddle.net/Victornpb/5axuh96u/
 * @see https://stackoverflow.com/a/7924240/938822
 */
function occurrences(string, subString, allowOverlapping) {

    string += "";
    subString += "";
    if (subString.length <= 0) return (string.length + 1);

    var n = 0,
        pos = 0,
        step = allowOverlapping ? 1 : subString.length;

    while (true) {
        pos = string.indexOf(subString, pos);
        if (pos >= 0) {
            ++n;
            pos += step;
        } else break;
    }
    return n;
}

  function check () {
    let arr = [];
    for (let i = 0; i < 10000; i++) {
        let str = String(i).padStart(4,0);
        str = str.split('');
        str = String(str.sort());
        arr.push(str);
    }
    arr = [... new Set(arr)];
    return arr;
  }