/*
The thunk function is from nathan (http://nathansuniversity.com/cont2.html)
*/
var thunk = function (f, lst) {
    return { tag: "thunk", func: f, args: lst };
};

var factorialThunk = function (n, cont) {
    if (n <= 1) {
        return thunk(cont, [1]);
    } else {
        var new_cont = function (v) {
            return thunk(cont, [v * n]);
        };
        return thunk(factorialThunk, [n - 1, new_cont] );
    }
};
