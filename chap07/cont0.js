/*
For control only, from nathan (http://nathansuniversity.com/cont1.html)
*/

var factorial = function (n) {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
};
