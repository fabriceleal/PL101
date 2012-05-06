var functions = {
    '+' : function(args, env){
        return evalScheem(args[0], env) + evalScheem(args[1], env);
    },
    '*' : function(args, env){
        return evalScheem(args[0], env) * evalScheem(args[1], env);
    },
    '/' : function(args, env){
        return evalScheem(args[0], env) / evalScheem(args[1], env);
    },
    '-' : function(args, env){
        return evalScheem(args[0], env) - evalScheem(args[1], env);
    }
};

var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
    }
    // Look at head of list for operation
    if(functions[expr[0]]){
        return functions[expr[0]]([expr[1], expr[2]], env);
    }
};

