
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
		console.log('quoting as-is:');
		console.log(args[0]);
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

		return 	function(myArg){
						//console.log('myArg = ' + JSON.stringify(myArg));
						return evalScheem(['let-one', argName, myArg /* Assume one arg!*/, body], env /*Capture the env of lambda.*/);
					};
    }/*, TODO REDO
    'lambda':function(args, env){
		var argNames = args[0];
		var body = args[1];

		return function(myArgs){
					// Shadow env with args
					var callingEnv = {
						bindings : {},
						outer : env
					};

					var toCall = body;

					argNames.forEach(function(item, idx){
						callingEnv.bindings[item] = myArgs[idx];						
					});
					
					// Call evalScheem
					return evalScheem(toCall, callingEnv);
				}
	}*/
};

// functions dont need env!
var initial_env = {
	'car':function(list){
		if(typeof list === 'undefined')
			throw 'Args evaluated to empty object in car!';

		if(list.constructor != Array)
			throw 'Evaluated arg is not an Array in car!';

		if(list.length == 0)
			throw 'Evaluated arg is an empty Array in car!';

		return list[0];
	},
	'cdr':function(list){
		if(typeof list === 'undefined')
			throw 'Arg evaluated to empty object in cdr!';

		if(list.constructor != Array)
			throw 'Evaluated arg is not an Array in cdr!';

		if(list.length == 0)
			throw 'Evaluated arg is an empty Array in cdr!';

		// This does like in Common Lisp, (cdr '(a)) => '()
		return list.slice(1);
	},
	'+' : function(fst){
		return function(snd){
			return fst + snd;
		};
	},
	'*' : function(fst){
		return function(snd){
			return fst * snd;
		};
	},
	'/' : function(fst){
		return function(snd){
			if(snd === 0)
				throw 'This language does not divide by zero!';

			return fst / snd;
		};
	},
	'-' : function(fst){
		return function(snd){
			return fst - snd;
		};
	},
	'<' : function(left){
		return function(right){
			return left < right ? '#t' : '#f';
		};
	},
	'>' : function(left){
		return function(right){
			return left > right ? '#t' : '#f';
		};
	},
	'cons':function(head){
		return function(tail){
			return [head].concat(tail);
		};
	},
	'=' : function(left){
		return function(right){
			return left == right ? '#t' : '#f';
		};
	},
	'emptyp' : function(list){
		// Like in common-lisp, NIL == '(). 
		return (list == null || (list.constructor == Array && list.length == 0)) ? '#t' : '#f' ;
	}
};

var evalScheem = function (expr, env) {
	//console.log(expr);
	//console.log(typeof expr);

	if(expr == null) {
		throw 'expr is null!';
	}
	if(env == null){
		throw 'env is null!';
	}

	// Numbers evaluate to themselves
	if (typeof expr === 'number') {
		//console.log('evaling as number');
		return expr;
	}

	// Functions evaluate to themselves (just to be sure!)
	if(typeof expr === 'function'){
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

	if(expr.length != 2)
		throw 'Invalid function application = ' + JSON.stringify(expr);

	// Assume that is user defined function, returned by evaling the head
	var tmp = evalScheem(expr[0], env);
	if(typeof tmp !== 'function')
		throw 'Head of ' + JSON.stringify(expr) + ' is not a function!';

	if(tmp){
		//console.log('arg = ' + JSON.stringify(expr[1]));
		// Every function has only one arg.
		return tmp(evalScheem(expr[1], env));
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





