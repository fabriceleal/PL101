
/*------ Extensions ------ */
Array.prototype.any = function(predicate){
	var found = false;
	var treatedPredicate = function(item){
		if(found)
			return false;

		if(predicate(item)){
			found = true;
			return true;
		}

		return false;
	};

	var tmp = this.filter(treatedPredicate);

	return (tmp && tmp.constructor == Array && tmp.length > 0);
};

/*-------- Aux functions ------------*/

var parseList = function(lst, env){
	return lst.map(function(item){ return evalScheem(item, env);});
};

var isNumber = function(arg){
	return typeof arg !== 'number';
}

var nbrReduction = function(name, args, env, mathFun){
	// Validate args
	if(!(args) || args.constructor != Array || args.length == 0){
                throw name + ' called without parameters!';
        }

	// Parse head
        var parsed = evalScheem(args[0], env);

        // If head is not a number
        if(!isNumber(parsed)){
                throw 'There are arguments in ' + name + ' that are not numbers!';
        }

	// Call recursively if there are any more args
	if(args.length > 1){
		return mathFun(parsed, nbrReduction(name, args.slice(1), env, mathFun));
	}
	return parsed;
}

var lookup = function (env, v) {
    if(!env || !env.bindings){
        return null;
    }

    if(env.bindings.hasOwnProperty(v)){
        return env.bindings[v];
    }

    return lookup(env.outer, v);
};

/*-------- The interpreter ---------*/

var functions = {
    '+' : function(args, env){

	return nbrReduction('+', args, env, function(x, y){return x + y;});
    },
    '*' : function(args, env){
	return nbrReduction('*', args, env, function(x, y){return x * y;});
    },
    '/' : function(args, env){
        return nbrReduction('/', args, env, function(x, y){ if(y == 0) throw 'Cannot divide by zero in Scheem!'; return x / y;});
    },
    '-' : function(args, env){
        return nbrReduction('-', args, env, function(x, y){return x - y;});
    },
    'define' : function(args, env){
        env[args[0]] = evalScheem(args[1], env);
        return 0;
    },
    'set!' : function(args, env){
	if(!env.hasOwnProperty(args[0]))
		throw args[0] + ' is not defined!';

        env[args[0]] = evalScheem(args[1], env);
        return 0;
    },
    'begin' : function(args, env){
	if(args.length == 0)
		throw 'No body for begin!';

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
    '=' : function(args, env){
        return evalScheem(args[0], env) == evalScheem(args[1], env) ? '#t' : '#f';
    },
    '<' : function(args, env){
        return evalScheem(args[0], env) < evalScheem(args[1], env) ? '#t' : '#f';
    },
    'cons':function(args, env){
        return [evalScheem(args[0], env)].concat(evalScheem(args[1], env));
    },
    'car':function(args, env){
	if(!args || args.constructor != Array || args.length == 0)
		throw 'No args for car!';

	if(args.length > 1)
		throw 'Weird number of args for car (1)!'

	var evaled = evalScheem(args[0], env);

	if(!evaled)
		throw 'Args evaluated to empty object in car!';

	if(evaled.constructor != Array)
		throw 'Evaluated arg is not an Array in car!';

	if(evaled.length == 0)
		throw 'Evaluated arg is an empty Array in car!';

        return evaled[0];
    },
    'cdr':function(args, env){
	if(!args || args.constructor != Array || args.length == 0)
                throw 'No args for cdr!';

        if(args.length > 1)
                throw 'Weird number of args for cdr (1)!'

	var evaled = evalScheem(args[0], env);

        if(!evaled)
                throw 'Args evaluated to empty object in cdr!';

        if(evaled.constructor != Array)
                throw 'Evaluated arg is not an Array in cdr!';

        if(evaled.length == 0)
                throw 'Evaluated arg is an empty Array in cdr!';

	// This does like in Common Lisp, (cdr '(a)) => '()
        return evaled.slice(1);
    },
    'if':function(args, env){
	if(!args || args.constructor != Array || args.length == 0)
                throw 'No args for if!';
        
        if(args.length != 3)
                throw 'Weird number of args for if (3)!';

        return evalScheem(args[0], env) == '#t' ? evalScheem(args[1], env) : evalScheem(args[2], env);
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
        return lookup(env, expr);
    }
    // Look at head of list for operation
    if(functions[expr[0]]){
        return functions[expr[0]](expr.slice(1), env);
    }
};


