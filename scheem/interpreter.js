
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

var isNumber = function(arg){
	return typeof arg === 'number';
};

var deepEqual = function(a, b){
	if(typeof a !== typeof b)
		return false;

	if(typeof a === 'object'){		
		if(a.constructor == Array){
			// Array
			if(a.length != b.length)
				return false;

			for(var i in a){
				if(!deepEqual(a[i], b[i])){
					return false;		
				}
			}
			
			return true;
		}else{
			// Dictionary
			// 1) Get array of keys for each dictionary
			var keys_a = [], keys_b = [];

			for(var ka in a){ keys_a.push(ka); }
			for(var kb in b){ keys_b.push(kb); }

			if(keys_a.length != keys_b.length){
				return false;
			}
			
			// 2) Compare the sorted keys, to check if both dictionaries have the same keys
			keys_a = keys_a.sort(function(a, b){ return a > b;});
			keys_b = keys_b.sort(function(a, b){ return a > b;});
			
			if(! deepEqual(keys_a, keys_b)){
				return false;
			}

			// 3) Compare values through  the dictionary
			for(var i in keys_a){
				if(! deepEqual(keys_a[i], keys_b[i])){
					return false;
				}
			}
			
			// 4) If you reach this point, you have deepEqual !
			return true;
		}
	}
	
	return a === b;	
};

var nbrReduction = function(name, args, mathFun){
	//console.log('nbrReduction');
	//console.log(args);

	// Validate args
	/* This is failing for some reason. FUCK YOU FIREFOX!
	if(!(args) || args.constructor != Array || args.length == 0){
		//console.log(args);
		//console.log(args.constructor != Array);
		//console.log(args.length);
		throw name + ' called without parameters!';
	}*/

	// Parse head

	// If head is not a number
	if(!isNumber(args[0])){
		throw 'There are arguments (' + args[0] +') in ' + name + ' that are not numbers!';
	}

	// Call recursively if there are any more args
	if(args.length > 1){
		//console.log(args.length);
		//console.log(args.slice(1));
		return mathFun(args[0], nbrReduction(name, args.slice(1), mathFun));
	}
	return args[0];
}

var lookup = function (env, v) {
	if(!env || !env.bindings){
		throw 'lookup couldnt find ' + v + ' in env!';
		//        return null;
	}

	if(env.bindings.hasOwnProperty(v)){
		return env.bindings[v];
	}

	return lookup(env.outer, v);
};

var update = function (env, v, val) {
	if(!env || !env.bindings){
		throw 'update couldnt find ' + v + ' in env!';
	}

	if(env.bindings.hasOwnProperty(v)){
		env.bindings[v] = val;
		return;
	}

	update(env.outer, v, val);
};


/*-------- The interpreter ---------*/
// Special forms are responsible for eval'ing and validating their args; 
// All user-function must receive their args already evaled, begin responsible for validating them.


var specials = {
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

		return 	function(myArgs, myEnv){
						return evalScheem(['let-one', args[0], myArgs[0]/* Assume one arg!*/, body], env /*Ignore myEnv. Capture the env of lambda.*/);
					};
    },
    'lambda':function(args, env){
		var argNames = args[0];
		var body = args[1];

		return function(myArgs, myEnv){
					// Shadow env with args
					var callingEnv = {
						bindings : {},
						outer : env
					};

					var toCall = body;

					argNames.forEach(function(item, idx){
						callingEnv.bindings[item] = evalScheem(myArgs[idx], myEnv);
						//console.log('set ' + item + ' to ' + myArgs[idx]);
					});

					//console.log(toCall);
					//console.log(callingEnv);
					// Call evalScheem
					return evalScheem(toCall, callingEnv);
				}
	}
};

// functions dont need env!
var initial_env = {
	'car':function(args){
		if(!args || args.constructor != Array || args.length == 0)
			throw 'No args for car!';

		if(args.length > 1)
			throw 'Weird number of args for car (1)!'

		if(typeof args[0] === 'undefined')
			throw 'Args evaluated to empty object in car!';

		if(args[0].constructor != Array)
			throw 'Evaluated arg is not an Array in car!';

		if(args[0].length == 0)
			throw 'Evaluated arg is an empty Array in car!';

		return args[0][0];
	},
	'cdr':function(args){
		if(!args || args.constructor != Array || args.length == 0)
			throw 'No args for cdr!';

		if(args.length > 1)
			throw 'Weird number of args for cdr (1)!'

		if(typeof args[0] === 'undefined')
			throw 'Args evaluated to empty object in cdr!';

		if(args[0].constructor != Array)
			throw 'Evaluated arg is not an Array in cdr!';

		if(args[0].length == 0)
			throw 'Evaluated arg is an empty Array in cdr!';

		// This does like in Common Lisp, (cdr '(a)) => '()
		return args[0].slice(1);
	},
	'+' : function(args){
		return nbrReduction('+', args, function(x, y){return x + y;});
	},
	'*' : function(args){
		return nbrReduction('*', args, function(x, y){return x * y;});
	},
	'/' : function(args){
		return nbrReduction('/', args, function(x, y){ if(y == 0) throw 'Cannot divide by zero in Scheem!'; return x / y;});
	},
	'-' : function(args){
		return nbrReduction('-', args, function(x, y){return x - y;});
	},
	'<' : function(args){
		return args[0] < args[1] ? '#t' : '#f';
	},
	'>' : function(args){
		return args[0] > args[1] ? '#t' : '#f';
	},
	'cons':function(args){
		return [args[0]].concat(args[1]);
	},
	'=' : function(args){
		return args[0] == args[1] ? '#t' : '#f';
	}
};

var evalScheem = function (expr, env) {
	if(expr == null) {
		throw 'expr is null!';
	}
	if(env == null){
		throw 'env is null!';
	}

	// For now, this will be needed ...
	/*if(deepEqual(env, {bindings:{}, outer:{}})){
		env = {
			bidings: initial_env,
			outer: env
		};
	}*/

	// Numbers evaluate to themselves
	if (typeof expr === 'number') {
		//console.log('evaling as number');
		return expr;
	}

	// Strings are variable references
	if (typeof expr === 'string') {
		//console.log('evaling as lookup');
		return lookup(env, expr);
	}

	// Look at head of list for operation
	if(specials.hasOwnProperty(expr[0])){
		//console.log('evaling as special form');
		return specials[expr[0]](expr.slice(1), env);
	}

	// Assume that is user defined function, returned by evaling the head
	var tmp = evalScheem(expr[0], env);
	if(tmp){
		//console.log('evaling as user function');
		return tmp(
				expr.slice(1).map(
						function(par){return evalScheem(par, env);}
				));
	}
};

var evalScheemExternal = function(expr, env){
	var new_env = {
		bindings: initial_env,
		outer: env
	};
	return evalScheem(expr, new_env);
}

//--------------------------





