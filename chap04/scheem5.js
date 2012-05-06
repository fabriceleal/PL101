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
    },
    'define' : function(args, env){
        env[args[0]] = evalScheem(args[1], env);
        return 0;
    },
    'set!' : function(args, env){
        env[args[0]] = evalScheem(args[1], env);
        return 0;
    },
    'begin' : function(args, env){
        // Eval head
        var res = evalScheem(args[0], env);
            
        // Eval recursively
        if(args.length > 1){
            //assert_eq(1,2,typeof this.begin);
            return this.begin(args.slice(1), env);
        }
        
        return res;
    },
    'quote' : function(args, env){
        return args[0];
    },
    '<' : function(args, env){
        return evalScheem(args[0], env) < evalScheem(args[1], env) ? '#t' : '#f';
    }
};

var evalScheem = function (expr, env) {
    //console.log(expr);
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
        return functions[expr[0]](expr.slice(1), env);
    }
};


