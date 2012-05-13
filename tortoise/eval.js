var Turtle = function(){


}


// Special forms


// Predifined functions

var operations = {
	'<' : { 
		type:'binary', 
		fun:function(left, right){ return left < right; } 
	},
	'+' : {
		type:'binary',
		fun:function(left, right) { return left + right; }
	},
	'*' : {
		type:'binary',
		fun:function(left, right) { return left + right; }
	}
};


function evalTyped(expr, resolved, env){
	switch(resolved.type){
		case 'binary':
			return resolved.fun(
					evalExpr(expr.left),
					evalExpr(expr.right));
		//---
	}
}

// TODO Bring lookup, add_binding

function evalExpr(expr, env){
	if(env == null){
		// Init env!
	}

	if(typeof expr === 'number'){
		return expr;
	}
	
	var typed = operations(expr.tag);
	if(typed){
		return evalTyped(expr, typed, env);
	}

	switch(expr.tag){
		case 'call':
		        // Get function value
		        var func = lookup(env, expr.name);
		        // Evaluate arguments to pass
		        var ev_args = [];
		        var i = 0;
		        for(i = 0; i < expr.args.length; i++) {
		            ev_args[i] = evalExpr(expr.args[i], env);
		        }
		        return func.apply(null, ev_args);
		case 'ident':
	        	return lookup(env, expr.name);			
	}

	throw 'Unexpected expression (' + expr.tag + ')';
}


var evalStatement = function (stmt, env) {
    var val = undefined;
    switch(stmt.tag) {
        case 'ignore':
            // f(1+1);, 1+1; ,.... 
            return evalExpr(stmt.body, env);
        case 'var':
            // Var Name;
            add_binding(env, stmt.name, 0);
            return 0;
        case ':=':
            // Left := Right
				val = evalExpr(stmt.right, env);
				update(env, stmt.left, val);
				return val;
        case 'if':
				// if( Expr ) { Body ... }
				if(evalExpr(stmt.expr, env)) {
            	val = evalStatements(stmt.body, env);
				}
				return val;
        case 'repeat':
				// repeat( Expr ) { Body ... }
            var times = evalExpr(stmt.expr);
            var val = null;
            while(times--){
                val = evalStatements(stmt.body);
            }
            return val;
        case 'define':
		     var new_func = function() {		         
		         var i;
		         var new_env;
		         var new_bindings;
		         new_bindings = { };
		         for(i = 0; i < stmt.args.length; i++) {
		             new_bindings[stmt.args[i]] = arguments[i];
		         }
		         new_env = { bindings: new_bindings, outer: env };
		         return evalStatements(stmt.body, new_env);
		     };
		     add_binding(env, stmt.name, new_func);
		     return 0;
    }
};


var evalStatements = function (seq, env) {
    var i;
    var val = undefined;
    for(i = 0; i < seq.length; i++) {
        val = evalStatement(seq[i], env);
    }
    return val;
};

