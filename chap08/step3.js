var evalTwo = function (expr0, expr1, env) {
    var state0 = stepStart(expr0, env);
    var state1 = stepStart(expr1, env);
        
    while(true) {
        if(!state0.done)
            step(state0);
        if(!state1.done)
            step(state1);
        if(state0.done && state1.done)
            return;
    }
};
