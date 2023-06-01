// 715 combinations of digits (according to Tina (and eventually, me too))
// Interesting cases: 8121, 8253, 1010, 8111TODO+*bug, 1099(has 22 solutions), 8674, 2869, 5264

// Take a four digit numstring, return an array of all solution strings. 
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
            if (eval(expression) === 10 && !leadingZeros) {
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
//  SC: '/1' or '*1' becomes '*1' and always associates with the last term. ('1991')
//  #SC: -0 becomes +0
//  SC: 1^exp always uses the larger number as the exp (ie 1^54, not 1^45)
//  SC: num^0 always uses the larger number as the exp (ie 54^0, not 45^0)
// TODO: probably no double exponents allowed
function orderExpression(expression) {
    let SCOneFactors = '';

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
                const divisor = factors.splice(ii, 1);
                divisors.push(divisor);
                if (divisor == '/1') { 
                    SCOneFactors += '*1';
                    divisors.pop();
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