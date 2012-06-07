
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

// My type system:
// seq
// atom*
// |- num
// |- bool
// |- string

// * - atom is not a actual type, but rather a collection of types

var typeExpr = function (expr, context /* this is the type context, of course */ ) {
	// "Scalars" *****************************
	if (typeof expr === 'number') {
		return base('num');
	}
	if (typeof expr === 'string') {
		return lookup(context, expr);
	}
	if (typeof expr === 'boolean') {
	   return base('bool');
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
		
		case 'set!': case 'begin': case 'define': case 'let-one':
			throw expr[0] + ' not implemented yet!';			
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
        throw new Error('Types of true and false do not match!');
    
    return trueBranch;
};

var typeExprLambdaOne = function (expr, context) {
    if(expr.length !== 4)
        throw new Error('Weird length (' + expr.length + ') ...');
    
    // Create new context with arg
    context = {
        bindings: { },
        outer: context
    };
    context.bindings[expr[1]] = expr[2];
        
    return {
        tag: 'arrowtype',
        left: expr[2],
        right: typeExpr(expr[3], context)
    };
};

/*
 * Tests if two types match
 */
var sameType = function (a, b) {
    if(a.tag !== b.tag)
        return false;
    
    switch(a.tag){
        case 'basetype':
				// basetypes - any non-seq should be considered an atom. 
				if(a.name === 'atom')
					return b.name !== 'seq';
				if(b.name === 'atom')
					return a.name !== 'seq';

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
	'define' : function(args, env, t_env){
		// This is equivalent to the ex6 from chap5 (funcs5.js)
		env.bindings[args[0]] = evalTScheem(args[1], env, t_env);
		t_env.bindings[args[0]] = typeExpr(args[1], t_env);
		return 0;
	},
	'set!' : function(args, env, t_env){
		update(env, args[0], args[1]);
		update(t_env, args[0], typeExpr(args[1], t_env));
		return 0;
	},
	'begin' : function(args, env, t_env){
		if(args.length == 0)
			throw 'No body for begin!';

		// Eval head
		var res = evalTScheem(args[0], env, t_env);

		// Eval recursively
		if(args.length > 1){
			//assert_eq(1,2,typeof this.begin);
			return this.begin(args.slice(1), env);
		}

		return res;
	},
	'quote' : function(args, env, t_env){
		//console.log('quoting as-is:');
		//console.log(args[0]);
		return args[0];
	},
	'if':function(args, env, t_env){
		if(!args || args.constructor != Array || args.length == 0)
			throw 'No args for if!';

		if(args.length != 3)
			throw 'Weird number of args for if (3)!';

		return evalTScheem(args[0], env, t_env) == '#t' ? evalTScheem(args[1], env, t_env) : evalTScheem(args[2], env, t_env);
	},
	'let-one':function(args, env, t_env){
		// Creates a new env, shadowing the previous one
		var varExprEvaled = evalTScheem(args[1], env, t_env)
		var myEnv = {
			'bindings': { },
			'outer' : env
		};
		myEnv.bindings[args[0]] = varExprEvaled;

		var myTEnv = {
			bindings : {},
			outer : t_env
		};
		myTEnv.bindings[args[0]] = typeExpr(varExprEvaled, t_env);

		return evalTScheem(args[2], myEnv, myTEnv);
	},
	'lambda-one':function(args, env, t_env){
		var argName = args[0];
		var body = args[1];

		return 	function(myArg){
						//console.log('myArg = ' + JSON.stringify(myArg));
						return evalTScheem(['let-one', argName, myArg /* Assume one arg!*/, body], env /*Capture the env of lambda.*/, t_env);
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
					
					// Call evalTScheem
					return evalTScheem(toCall, callingEnv);
				}
	}*/
};


// functions dont need env!
var initial_env_types = {
	'car' : arrow(base('seq'), base('atom')),
	'cdr' : arrow(base('seq'), base('seq')),
	'cons': arrow(base('atom'), arrow(base('seq'), base('seq'))),
	'empty-p': arrow(base('seq'), base('bool')),
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

var evalTScheem = function (expr, env, t_env) {
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
		return lookup(env, expr, t_env);
	}

	// Look at head of list for operation
	if(specials.hasOwnProperty(expr[0])){
		//console.log('evaling as special form');
		return specials[expr[0]](expr.slice(1), env, t_env);
	}

	if(expr.length != 2)
		throw 'Invalid function application = ' + JSON.stringify(expr);

	// Assume that is user defined function, returned by evaling the head
	var tmp = evalTScheem(expr[0], env, t_env);
	if(typeof tmp !== 'function')
		throw 'Head of ' + JSON.stringify(expr) + ' is not a function!';

	if(tmp){
		// Before evaling a function,
		// get arg type, get function type, test
		var arg = evalTScheem(expr[1], env, t_env);
		var argType = typeExpr(arg, t_env);
		var funType = lookup(t_env, expr[0]);

		if (! sameType( argType , funType.left )){
			throw 'Expression of type ' + prettyType(argType) + ' cannot be used as arg for function ' + expr[0] + ' which is ' + prettyType(funType);
		}

		return tmp(arg);
	}
};

/*
 * Evals a tscheem expression
 */
var evalTScheemExternal = function(expr){
	var new_env = {
		bindings: initial_env,
		outer : {}
	};
	var new_type_env = {
		bindings: initial_env_types,
		outer : {}
	};
	return evalTScheem(expr, new_env, new_type_env);
}

//--------------------------





