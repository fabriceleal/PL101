/*
thunk, thunkValue, sumThink and trampoline from nathan (http://nathansuniversity.com/cont3.html)
*/

var thunk = function (f, lst) {
    return { tag: "thunk", func: f, args: lst };
};

var thunkValue = function (x) {
    return { tag: "value", val: x };
};

var trampoline = function (thk) {
    /* Instead of using recursion, uses an infinite loop, updates thk, as soon
	as thk is a value, returns */
    while (true) {
        if (thk.tag === "value") {
            return thk.val;
        }
        if (thk.tag === "thunk") {
            thk = thk.func.apply(null, thk.args);
        }
    }
};

var sumThunk = function (n, cont) {
    if (n <= 1) return thunk(cont, [1]);
    else {
        var new_cont = function (v) {
            return thunk(cont, [v + n]);
        };
        return thunk(sumThunk, [n - 1, new_cont]);
    }
};


var bigSum = function (n) {
    return trampoline({
        tag: "thunk",
        func: sumThunk,
        args: [n, thunkValue]
    });
};


var stupidBigSum = function (n){
	if ( n<= 1) return 1;
	return n + stupidBigSum(n - 1);
}

/*

	bigSum(5000000) => 12500002500000
	stupidBigSum(5000000) => RangeError: Maximum call stack size exceeded

*/

