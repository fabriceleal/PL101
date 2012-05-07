
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

var parseList = function(lst){
	return lst.map(function(item){ return evalScheem(item);});
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
        if(isNumber(parsed)){
                throw 'There are arguments in ' + name + ' that are not numbers!';
        }

	// Call recursively if there are any more args
	if(args.length > 1){
		return mathFun(parsed, nbrReduction(name, args.slice(1), env, mathFun));
	}
	return parsed;
}

/*-------- The interpreter ---------*/

var functions = {
    '+' : function(args, env){

	return nbrReduction('+', args, env, function(x, y){return x + y;});
    },
    '*' : function(args, env){
	return nbrReduction('*', args, env, function(x, y){return x * y;});
    },
    '/' : function(args, env){
        return nbrReduction('/', args, env, function(x, y){ return x / y;});
    },
    '-' : function(args, env){
        return nbrReduction('-', args, env, function(x, y){return x - y;});
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
        return evalScheem(args[0], env)[0];
    },
    'cdr':function(args, env){
        return evalScheem(args[0], env).slice(1);
    },
    'if':function(args, env){
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
        return env[expr];
    }
    // Look at head of list for operation
    if(functions[expr[0]]){
        return functions[expr[0]](expr.slice(1), env);
    }
};


