// You have to include type-literal.js

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

/*-------- Static Typing ---------*/

/*
 * Helper - create basetype label
 */
var base = function (name) {
    return { tag: 'basetype', name: name };
};

/*
 * Helper - create arrow label
 */
var arrow = function (left, right) {
    return { tag: 'arrowtype', 
             left: left,
             right: right };
};

/*
 * Prettyfies a type
 */
var prettyType = function (type) {
    if(!type.hasOwnProperty('tag'))
        throw new Error('Arg doesnt have tag!');
    
    switch(type.tag){
        case 'basetype':
            return type.name;
        case 'arrowtype':
            return '(' + prettyType(type.left) + ' -> ' + prettyType(type.right) +')';
    }
    
    throw new Error('Unexpected tag: ' + type.tag);
};

/* 
 My type system:
  any*
  |-seq
  |-atom*
  | |- num
  | |- bool
  | |- string
  |-arrow**

 (*) - these are not actual types, but rather a collection of types 
 (**) - arrow is an infinite set in the form (type -> type)

 */

/*
 * Converts a parsed expression (such as ["num", "->", "num"]) 
 * into its literal form (such as "(num -> num)")
 */
var exprToType = function(expr){
	try{
		var collapse = function(arg){
			if(typeof arg === 'function')
				throw new Error('Are you braindead???');
			if(typeof arg !== 'object')
				return arg;
			return '(' + arg.map(collapse).join(' ') + ')';
		};
		return typeparser.parse(collapse(expr));
	}catch(e){
		throw new Error('Error processing type literal: ' + e.toString());
	}
}

var typeExpr = function (expr, context /* this is the type context, of course */ ) {
	// "Scalars" *****************************
	if (typeof expr === 'number') {
		return base('num');
	}	
	if (typeof expr === 'boolean' || expr === "#t" || expr === "#f") {
	   return base('bool');
	}
	if (typeof expr === 'string') {
		return lookup(context, expr);
	}

	// Special forms *************************
	switch(expr[0]){
		case 'if':
			return typeExprIf(expr, context);
	
		case 'lambda-one':
			return typeExprLambdaOne(expr, context);
	
		case 'quote':
			var elem = expr[1];
			/*
			console.log( elem );
			console.log( elem.constructor );

			console.log( elem instanceof Array );
			console.log( elem.constructor == Array );
			console.log( elem.constructor === Array );*/

			// I don't know why, but I can't find a way of checking if elem is an array. 
			// All the usual checks fail!!! FUCK!!!
			if(elem.hasOwnProperty('length')){
				return base('seq');
			}else if (typeof elem === 'string'){
				return base('string');
			}else{
				return typeExpr(elem, context);
			}
		case 'define':
			if(expr.length != 4)
				throw new Error('define called with invalid number of args (' + (expr.length - 1) + ')');

			// (define var-name var-type expr)
			var defType = exprToType(expr[2]);
			
			// Update the context and pass it to the typeExpr that 
			// evaluates the expr in (define ...). This way
			// we can have recursive definitions. If something does not
			// work out well, an exception is thrown, so no need to build
			// temporary contexts ...
			context.bindings[expr[1]] = defType;
			var exprType = typeExpr(expr[3], context);

			if(! sameType(defType, exprType))
				throw new Error('The type of the define ' + prettyType(defType) + ' does not match the type of the expr ' + prettyType(exprType));
			
			return defType;
		case 'begin': 
			var len = expr.length;
			if(len == 1)
				throw new Error('begin statement with no expressions?');

			for(var i = 1; i < len-1; i++){
				typeExpr(expr[i], context);
			}

			return typeExpr(expr[len - 1], context);
		case 'let-one':
			// (let-one var-name var-expr inner-expr)

			var newCtx = {
				bindings: {},
				outer : context
			};
			newCtx.bindings[expr[1]] = typeExpr(expr[2], context);
			
			return typeExpr(expr[3], newCtx);
			
		case 'set!': 
			// (set! var-name var-expr)
			var slotType = lookup(context, expr[1]);
			var cmpType = typeExpr(expr[2], context);

			//console.log(prettyType(slotType));
			//console.log(prettyType(cmpType));

			if(sameType( slotType, cmpType )){
				return slotType;
			}

			throw 'Expression of type ' + prettyType(cmpType) + ' does not match slot type ' + prettyType(slotType);

		case 'lambda':
			return typeExprLambda(expr, context);
	}

	// Application (A B) *********************

	var A = expr[0];
	var B = expr[1];
	var A_type = typeExpr(A, context);
	var B_type = typeExpr(B, context);
	// Check that A type is arrow type
	if (A_type.tag !== 'arrowtype') {
		throw new Error('Not an arrow type');
	}
	var U_type = A_type.left;
	var V_type = A_type.right;

	// Verify argument type matches
	if (sameType(U_type, B_type) === false) {
		throw new Error('Argument type did not match');
	}

	return V_type;
};

var typeExprIf = function (expr, context) {
    if(expr.length !== 4)
        throw new Error('Weird size (' + expr.length +')... ');
        
    if(!sameType(typeExpr(expr[1], context), typeExpr(true, {})))
        throw new Error('Condition expr is not bool!');
    
    var trueBranch = typeExpr(expr[2], context);    
    var falseBranch = typeExpr(expr[3], context);
    
    if(!sameType(trueBranch, falseBranch))
        throw new Error('Types of true ' + prettyType(trueBranch) + ' and false ' + prettyType(falseBranch) + ' do not match!');
    
    return trueBranch;
};

var typeExprLambda = function (expr, context){
	// (lambda (var-name var-type ...) body)
	if(expr.length !== 3)
		throw new Error('Weird length for lambda (' + expr.length + ') ...');

	var args = expr[1];

	if(args.length === 0)
		throw new Error('lambdas with no args are not supported!');

	var body = expr[2];

	var finalType = { tag: 'arrowtype', left: {}, right: {} };
	var currentBranch = finalType;

	for(var i = 0; i < args.length; i+=2){
		var typeOfArg = exprToType(args[i + 1]);
		// Build context
		context = {
			bindings:{},
			outer: context
		};
		context.bindings[ args[i] ] = typeOfArg;
		// Build function type
		if(i != 0){
			currentBranch.right = { tag: 'arrowtype', left: {}, right: {} };
			currentBranch = currentBranch.right;
		}
		currentBranch.left = typeOfArg;
	}

	// Eval body's type
	currentBranch.right = typeExpr(body, context /* This context is not the original, at this point have the args */);
	
	return finalType;
}

var typeExprLambdaOne = function (expr, context) {
	// (lambda-one arg-name arg-type body)
	if(expr.length !== 4){
		throw new Error('Weird length for lambda-one (' + expr.length + ') ...');
	}

	// Create new context with arg
	context = {
		bindings: { },
		outer: context
	};	
	context.bindings[expr[1]] = exprToType(expr[2]);

	return arrow(
			context.bindings[expr[1]], 
			typeExpr(expr[3], context) );
	//---
};

/*
 * Tests if two types match
 */
var sameType = function (a, b) {
	if(a.name === 'any' || b.name === 'any')
		return true;

	if(a.tag !== b.tag)
		return false;

	switch(a.tag){
		case 'basetype':
			// basetypes - any non-seq should be considered an atom. 
			if(a.name === 'atom')
				return (b.name !== 'seq');
			if(b.name === 'atom')
				return (a.name !== 'seq');

			return (a.name === b.name);
		case 'arrowtype':
			return sameType(a.left, b.left) && sameType(a.right, b.right);
	}
	throw new Error('Unexpected on sameType!');
};

/*-------- The interpreter ---------*/
// Special forms are responsible for eval'ing and validating their args; 
// All user-function must receive their args already evaled, begin responsible for validating them.


var specials = {
	'define' : function(args, env){
		if(args.length != 3)
			throw 'define called with invalid number of arguments (' + args.length + ')';
		// This is equivalent to the ex6 from chap5 (funcs5.js)
		// (define var-name var-type expr)
		env.bindings[args[0]] = evalTScheem(args[2], env);
		// hmmm ... no need to update the type. won't be used anywhere.
		return 0;
	},
	'set!' : function(args, env){
		update(env, args[0], args[1]);
		// hmmm... no need to update the type. typeExpr prevents this.
		return 0;
	},
	'begin' : function(args, env){
		if(args.length == 0)
			throw 'No body for begin!';

		// Eval head
		var res = evalTScheem(args[0], env);

		// Eval recursively
		if(args.length > 1){
			//assert_eq(1,2,typeof this.begin);
			return this.begin(args.slice(1), env);
		}

		return res;
	},
	'quote' : function(args, env){
		//console.log('quoting as-is:');
		//console.log(args[0]);
		return args[0];
	},
	'if':function(args, env){
		if(!args || args.constructor != Array || args.length == 0)
			throw 'No args for if!';

		if(args.length != 3)
			throw 'Weird number of args for if (3)!';

		return evalTScheem(args[0], env) == '#t' ? evalTScheem(args[1], env) : evalTScheem(args[2], env);
	},
	'let-one':function(args, env){
		// Creates a new env, shadowing the previous one
		var varExprEvaled = evalTScheem(args[1], env)
		var myEnv = {
			'bindings': { },
			'outer' : env
		};
		myEnv.bindings[args[0]] = varExprEvaled;

		return evalTScheem(args[2], myEnv);
	},
	'lambda-one':function(args, env){
		if(args.length != 3)
			throw new Error('lambda-one with invalid number of args (' + args.length + ').');

		var argName = args[0];
		var body = args[2];

		return 	function(myArg){
						//console.log('myArg = ' + JSON.stringify(myArg));
						return evalTScheem(
								[
									'let-one', 
									argName, 
									["quote", myArg] /* Assume one arg! Quote it. It is already evaled, but let-one will re-eval-it*/, 
									body
								], 
								env /*Capture the env of lambda.*/);
					};
    },
    'lambda':function(args, env){
		//throw new Error('Not yet implemented!');
		if(args.length != 2){
			throw 'Lambda called with invalid number of args (' + args.length + ')';
		}
		
		var myArgs = args[0];

		if(myArgs.length === 0){
			throw 'lambdas with no args are not supported!';
		}

		var body = args[1];

		var argIdx = 0, argMax = myArgs.length - 2; // -1 (fix to 0-based indexing) -1 (var-names in "even" indexes)

		return function nextArg (arg){
			// Manipulate env
			env = {
				bindings:{},
				outer: env
			};
			env.bindings[ myArgs[ argIdx ] ] = arg;
			
			if(argIdx > argMax)
				throw new Error('(argIdx > argMax) - This cant happen!');

			if(argIdx === argMax ){
				// Eval body
				return evalTScheem(body, env)
			}else{
				// Increment by 2. lambda is declared with var-name var-type var-name var-type ....
				argIdx += 2;
				// Return curried for the next arg
				return nextArg;
			}

		};
/*
		// Create nested functions.
		for(var i = myArgs.length - 2; i >= 0; i-=2){
			var argName = myArgs[i];

			if(res == null){
				// This is the last arg. Instead of returning a curried function, eval body
				res = function(arg){
					// Manipulate env
					env = {
						bindings:{},
						outer: env
					};
					env.bindings[ argName ] = arg;
					// Eval body
					return evalTScheem(body, env);
				};
			}else{
				// this is any arg besides the last. Return a curried function.
				res = function(arg){
					// Manipulate env
					env = {
						bindings:{},
						outer: env
					};
					env.bindings[ argName ] = arg;
					// Nest function
					return res;
				};
			}

		}

		return res;*/
		/*
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
					
					// Call evalTScheem
					return evalTScheem(toCall, callingEnv);
				}*/
	}
};


// functions dont need env!
var initial_env_types = {
	'car' : arrow(base('seq'), base('any')),
	'cdr' : arrow(base('seq'), base('seq')),
	'cons': arrow(base('atom'), arrow(base('seq'), base('seq'))),
	'emptyp': arrow(base('seq'), base('bool')),
	'+' : arrow(base('num'), arrow(base('num'), base('num'))),

	'-' : arrow(base('num'), arrow(base('num'), base('num'))),
	'/' : arrow(base('num'), arrow(base('num'), base('num'))),
	'*' : arrow(base('num'), arrow(base('num'), base('num'))),

	'=' : arrow(base('num'), arrow(base('num'), base('bool'))),
	'<' : arrow(base('num'), arrow(base('num'), base('bool'))),
	'>' : arrow(base('num'), arrow(base('num'), base('bool')))
};

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

var evalTScheem = function (expr, env) {
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
	
	// Return bool literals as-is
	if(expr === '#t' || expr === '#f'){
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

	if(expr.length != 2){
		throw 'Invalid function application (more than 1 arg!) = ' + JSON.stringify(expr);
	}

	// Assume that is user defined function, returned by evaling the head
	var tmp = evalTScheem(expr[0], env);
	if(typeof tmp !== 'function'){
		throw 'Head of ' + JSON.stringify(expr) + ' is not a function!';
	}

	if(tmp){
		// Before evaling a function,
		// get arg type, get function type, test
		var arg = evalTScheem(expr[1], env);

		return tmp(arg);
	}
};

/*
 * Evals a tscheem expression
 */
var evalTScheemExternal = function(expr, Venv){	
	// Ugly hack: Get the types of the given env. I know its ugly.
	var Tenv = { bindings:{}, outer:{} };
	
	var setTypes = function(ctx, env){
		if(env == null){
			return;
		}
		if(ctx.bindings == null){
			ctx.bindings = [];
		}
		if(ctx.outer == null){
			ctx.outer = [];
		}
		if(env.bindings != null){
			for(var k in env.bindings){
				ctx.bindings[k] = typeExpr(env.bindings[k]);
			}

			if(env.outer != null){
				setTypes(ctx.outer , env.outer);
			}
		}
	};

	setTypes(Tenv, Venv);

	var new_type_env = {
		bindings: initial_env_types,
		outer : Tenv
	};	

	if(!evalTScheemTypes(expr, new_type_env)){
		throw new Error('Invalid return by evalTScheemTypes');
	}

	var new_env = {
		bindings: initial_env,
		outer : Venv
	};
	
	return evalTScheem(expr, new_env);
}

var evalTScheemTypes = function(expr, env){
	var new_type_env = {
		bindings: initial_env_types,
		outer : {}
	};

	if(env != null){
		new_type_env.outer = env;
	}

	return typeExpr(expr, new_type_env);
}

//--------------------------





