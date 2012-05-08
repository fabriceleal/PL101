
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
	return typeof arg === 'number';
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
                throw 'There are arguments (' + parsed +') in ' + name + ' that are not numbers!';
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

var update = function (env, v, val) {
    // TODO If not defined, throw error!
    if(!env || !env.bindings){
        return;
    }
    
    if(env.bindings.hasOwnProperty(v)){
        env.bindings[v] = val;
        return;
    }
    
    update(env.outer, v, val);
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
	// This is equivalent to the ex6 from chap5 (funcs5.js)
        env.bindings[args[0]] = evalScheem(args[1], env);
        return 0;
    },
    'set!' : function(args, env){
	update(env, args[0], args[1]);
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
    },
    'let-one':function(args, env){
	// Creates a new env, shadowing the previous one
	var varExprEvaled = evalScheem(args[1], env)
	var myEnv = {
		'bindings': { },
		'outer' : env
	};
	myEnv.bindings[args[0]] = varExprEvaled;
	
	return evalScheem(args[2], myEnv);
    },
    'lambda-one':function(args, env){
	var argName = args[0];
	var body = args[1];

	// TODO Validate if argName is not an array
	
	// FIXME Now I have a problem. If I use env, I don't have recursion; If I use myEnv, I don't have closures

	return function(myArgs, myEnv){
		return evalScheem(['let-one', args[0], myArgs[0]/* Assume one arg!*/, body], env /*Ignore myEnv. Capture the env of lambda.*/);
	};
    },
    'lambda':function(args, env){
	var argNames = args[0];
	var body = args[1];

	return function(myArgs, myEnv){
		// Shadow env with args
		var callingEnv = env;

		// FIXME Now I have a problem. If I use env, I don't have recursion; If I use myEnv, I don't have closures
		var toCall = body;
	
		// Build body	
		argNames.forEach(function(item, idx){
			toCall = ['let-one', item, myArgs[idx], toCall];
		});

		// Call evalScheem
		return evalScheem(toCall, callingEnv);
	}
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
    if(functions.hasOwnProperty(expr[0])){
        return functions[expr[0]](expr.slice(1), env);
    }

    // Assume that is user defined function, returned by evaling the head
    var tmp = evalScheem(expr[0], env);
    if(tmp){
	return tmp(expr.slice(1), env);
    }
};


