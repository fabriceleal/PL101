var functions = {
    '+' : function(args){
        return evalScheem(args[0]) + evalScheem(args[1]);
    },
    '*' : function(args){
        return evalScheem(args[0]) * evalScheem(args[1]);
    },
    '/' : function(args){
        return evalScheem(args[0]) / evalScheem(args[1]);
    },
    '-' : function(args){
        return evalScheem(args[0]) - evalScheem(args[1]);
    }
};

var evalScheem = function (expr) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    
    if(functions[expr[0]]){
        return functions[expr[0]]([expr[1], expr[2]]);
    }
};
