let numberDisplay = document.getElementById('number');
let inputField = document.getElementById('input');
let messageField = document.getElementById('message');
let dynamicColumn = document.getElementById('dynamicColumn');
let giveUpButton = document.getElementById('giveUpButton');
let keyboard = document.getElementById('keyboard');
let numKeys = keyboard.getElementsByClassName('num');
let backKey = document.getElementById('back');

let number = '';
let remainingSolutions = [];
let correctGuesses = [];

while (remainingSolutions.length == 0) {
    number = String(Math.floor(Math.random()*10000)).padStart(4,0);
    remainingSolutions = findSolutions(number);
}

numberDisplay.textContent = number;
inputField.focus();
setTimeout(function(){
    const gameWon = remainingSolutions.length === 0;
    if (!gameWon) { // If game not won
        giveUpButton.disabled = false; 
    }
}, 5*60*1000); // (ms) 5 minutes

inputField.add
// So it is always selected
inputField.onblur = function () {
    setTimeout(function () {
        inputField.focus();
    })
};

disableInvalidKeys();

function keyPressed(event) {
    const cursorPos = inputField.selectionEnd;
    const id = event.target.id;
    let str = inputField.value;

    messageField.textContent = '';

    if (id === 'enter') { guess(); return; }
    if (id === 'back') {
        inputField.value = str.slice(0, cursorPos-1) + str.slice(cursorPos);
        inputField.focus();
        inputField.setSelectionRange(cursorPos-1, cursorPos-1);
    } else {
        inputField.value = str.slice(0, cursorPos) + event.target.id + str.slice(cursorPos);
        inputField.focus();
        inputField.setSelectionRange(cursorPos+1, cursorPos+1);
    }

    disableInvalidKeys();
}


function disableInvalidKeys() {
    // Disable numkeys
    for(let i = 0; i < numKeys.length; i++) {
        numKeys[i].disabled = true;
    }

    // Get digits to enable
    let enteredDigits = inputField.value.replace(/\D/g,'');
    let remainingDigits = number;
    for (let i = 0; i < enteredDigits.length; i++) {
        remainingDigits = remainingDigits.replace(enteredDigits[i], '');
    }

    if (inputField.value.length == 0) {
        backKey.disabled = true; //disable back key
    } else {
        backKey.disabled = false;
    }

    //Enable digits
    for (let keyi = 0; keyi < numKeys.length; keyi++) {
        for (let remi = 0; remi < remainingDigits.length; remi++) {
            if (numKeys[keyi].id == remainingDigits[remi]) {
                numKeys[keyi].disabled = false;
            }
        }
    }
    
}

function solutionEntered(event) {
    if (event.keyCode !== (13 ||  8)) { messageField.textContent = '\xA0'; return; } // 'Enter' or 'Backspace' key
    guess();
    
}

function guess() {
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
            // Add messageField
            ele = document.createElement('div');
            ele.setAttribute('id', 'message');
            dynamicColumn.appendChild(ele);
            messageField = document.getElementById('message');
            
            messageField.textContent = 'All solutions found!';
            giveUpButton.hidden = true;
            keyboard.hidden = true;
            
        } else {
            // Add field
            let ele = document.createElement('input');
            ele.setAttribute('id', 'input');
            ele.setAttribute('autocomplete', 'off');
            ele.setAttribute('onkeypress', 'solutionEntered(event)');
            ele.setAttribute('inputmode', 'none');
            dynamicColumn.appendChild(ele);
            inputField = document.getElementById('input');
            inputField.focus();

            // Add messageField
            ele = document.createElement('div');
            ele.setAttribute('id', 'message');
            dynamicColumn.appendChild(ele);
            messageField = document.getElementById('message');
            
            // So it is always selected
            inputField.onblur = function () {
                setTimeout(function () {
                    inputField.focus();
                })
            };

            for (let i = 0; i < remainingSolutions.length-1; i++) {
                let ele = document.createElement('div');
                ele.setAttribute('class', 'hiddenSolution');
                dynamicColumn.appendChild(ele);
            }
        }
    } else {
        messageField.textContent = 'Illegal guess';
    }
    disableInvalidKeys();
}

function giveUp(event) {
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

    // Add revealed solutions in pink
    for (let i = 0; i < remainingSolutions.length; i++) {
        let ele = document.createElement('div');
        ele.setAttribute('class', 'revealedSolution');
        ele.textContent = remainingSolutions[i].replaceAll('**', '^');
        dynamicColumn.appendChild(ele);
    }

    giveUpButton.hidden = true;
}


// 715 combinations of digits (according to Tina (and eventually, me too))
// Interesting cases: 8121, 8253, 1010, 8111, 1099(has 22 solutions), 8674!, 2869, 5264, 8427, 6032!!(60/2/3) 6132 2389 2368, 2345. 2245 2255 0248 5132 3456 3147
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
                if (orderExpression(expression) == '9+19*1') {
                    console.log('expression 9+19*1: ' + expression);
                }
                arr.push(orderExpression(expression));
            }
        }      
    }

    arr = [... new Set(arr)]; // remove duplicates
    return arr;
}

// Takes an expression string, applies the following rules:
//    (most importantly the rules are consistent, if somewhat arbitrary)
//  Factors are consistently ordered ascending by js sort() (divisors at end)
//  Sums are consistently ordered descending by js sort()
//  SC: '/1' or '*1' or ^1 becomes '*1' and always associates with the last term. ('1991')
//  SC: -0 becomes +0
//  SC: 1^exp always uses the larger number as the exp (ie 1^54, not 1^45)
//  SC: num^0 always uses the larger number as the exp (ie 54^0, not 45^0)
//  SC: The term 0/4 -> 0*4

function orderExpression(expression) {
    let OneFactors = []; // for special cases resolving to 1 to be added at end
    let emptyTerm = false; // when removal of OneFactors takes out an entire term

    expression = expression.replaceAll(' ', '');
    let terms = (expression[0] + expression.slice(1).replaceAll('-', '+-')).split('+');
    for (let i = 0; i < terms.length; i++) {
        const isOneDigit = terms[i].length == 1 || (terms[i][0] === '-' && terms[i].length === 2);
        if (isOneDigit) { 
            if (terms[i] == '-0') { 
                terms[i] = '0';
            } 
            continue; 
        }
        
        let minusSign = null;
        if (terms[i][0] === '-') {
            terms[i] = terms[i].slice(1);
            minusSign = '-';
        }

        terms[i] = terms[i].replaceAll('**', '^');

        // SC 0/4 or 0^4 -> 0*4
        if (/\D0(\/|\^)/.test(' ' + terms[i] + ' ')) { // if there is a '0/something'
            terms[i] = terms[i].replaceAll('/', '*');
            terms[i] = terms[i].replaceAll('^', '*');
        }

        let factors = terms[i].replaceAll('/', '*/').split('*');

        // Seperate divisors (factors: [2, /6] -> factors: [2] divisors [6]) 
        let divisors = [];
        for (let ii = factors.length-1; ii >= 0; ii--) {
            if (factors[ii][0] == '/') {
                let divisor = String(factors.splice(ii, 1)); //Remove divisor from arr
                divisor = divisor.slice(1);
                if (divisor == '1') { 
                    OneFactors.push(divisor); // add to OneFactors
                } else if (divisor.includes('^0') || divisor.includes('1^')) {
                    divisor = orderExponent(divisor);
                    OneFactors.push(divisor);
                } else if (/\^1\D/.test(divisor + ' ')) { // All powers of 1 become *1\
                    divisor = divisor.replace('^1', ''); 
                    OneFactors.push('1');
                    divisors.push(divisor);
                } else if (divisor.includes('^')) {
                    divisor = orderExponent(divisor);
                    divisors.push(divisor);
                } else {
                divisors.push(divisor);
                }
            }
        }
        divisors = divisors.sort();
        
        // Remove factors of one 

        let initialFactorsLength = factors.length;
        for (let ii = factors.length-1; ii >= 0; ii--) {
            if (initialFactorsLength > 1 && factors[ii] == '1') {  
                 OneFactors.push(factors.splice(ii, 1));
                 if (factors.length == 0) { emptyTerm = true;}
            } else if (initialFactorsLength > 1 && 
                (factors[ii].includes('^0') || factors[ii].includes('1^'))) {
                let expFactorOne = factors.splice(ii, 1);
                if (factors.length == 0) { emptyTerm = true;}
                OneFactors.push(orderExponent(expFactorOne));
            } else if (/\^1\D/.test(factors[ii] + ' ')) { // Contains ^1 (not ie ^15)
                factors[ii] = factors[ii].replace('^1', '');
                OneFactors.push('1');
            } else if (factors[ii].includes('^')) {
                factors[ii] = orderExponent(factors[ii]);
            }
        }
        factors.sort();

        for (let ii = 0; ii < divisors.length; ii++) {
            divisors[ii] = '/' + divisors[ii];
        }
        divisors = divisors.join('');
        factors = factors.join('*');
        terms[i] = factors + divisors;
        if (minusSign !== null ) { 
            if (eval(terms[i].replaceAll('^','**')) !== 0) {
                terms[i] = '-' + terms[i]; 
            }
        }
    }
    terms = terms.filter(n => n); // Remove empty elements, but should be unnecessary?
    OneFactors = OneFactors.sort();
    terms = terms.sort().reverse().join('+').replaceAll('+-', '-');
    if (OneFactors.length > 0) { OneFactors = OneFactors.join('*'); }

    let ordered = terms;
    if (emptyTerm) {
        ordered = ordered + '+' + OneFactors;
    } else if (OneFactors.length > 0) {
        ordered = (ordered + '*' + OneFactors);
    }

    return ordered.replaceAll('^', '**');
}

// 76^0 -> 67^0, 0^76 -> 0^67, 1^76 -> 1^67
function orderExponent(expFactor) {
    expFactor = String(expFactor);
    split = expFactor.split('^');
    base = split[0];
    exp = split[1];

    if (base.length > 1 && (exp == '0' || '1')) {
        return base.split('').sort().reverse().join('')+ '^' + exp;
    } else if ((base == '1' || '0') && exp.length > 1) {
        return base + '^' + exp.split('').sort().reverse().join('');
    }
    return expFactor;
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