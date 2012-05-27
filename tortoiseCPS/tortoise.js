
/*
"Rewrites" "normal" functions to accept thunked args and return thunked values
This wont work for recursive functions. If needed, use the Y-combinator
*/
var simpleFunCombinator = function(v){
	return function(args, env, cont, xcont){
		//var args = Array.prototype.slice.call(arguments); 
		mylog("ENTER IN COMBINATED");
		//mylog(args);
		//args = args[0]; // The rest is the env, cont and xcont
		mylog(args);
		var res = v.apply(null, args.map(
											function(n){
												mylog("TO PARSE:"); 
												mylog(n); 
												var res = trampoline(n); 
												mylog("PARSED:"); 
												mylog(res); 
												return res; 
											}));
		
		if(res == undefined)
			res = 0;
		
		return cont(res);
	}
}

// GRAPHIC ENV

var GraphicEnv = function(id, onCreated){
	this.paper = Raphael(id);
	this.id = id;
	this.clear();
};

GraphicEnv.prototype.clear = function(){
	this.paper.clear();
	this.turtles = {};

	var $elem = $('#' + this.id);
	createTurtle('default', 'black', $elem.width() / 2, $elem.height() / 2, env, this).assignEnv(env);
};

GraphicEnv.prototype.addTurtle = function(turtle){
	turtle.paper = this.paper;
	this.turtles[turtle.name] = turtle;
	return turtle;
};

// TURTLE

var Turtle = function(name, color, location){
	this.name = name;
	this.originx = location.x;
	this.originy = location.y;
	this.color = color;
	this.paper = undefined;
};

Turtle.prototype.init = function () {
	this.x = this.originx;
	this.y = this.originy;
	this.angle = 90;
	this.width = 4;
	this.opacity = 1.0;
	this.pen = true;
	this.turtleimg = undefined;
	this.updateTurtle();

	return this;
};

Turtle.prototype.updateTurtle = function () {
	if(this.turtleimg == undefined) {
		this.turtleimg = this.paper.image(
				"livetest_files/turtle2.png",
				0, 0, 64, 64);
	}

	this.turtleimg.attr({
			x: this.x - 32,
			y: this.y - 32,
			transform: "r" + (-this.angle)});
	// ---

	this.turtleimg.toFront();

	return this;
};
Turtle.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
};
Turtle.prototype.setWidth = function(width) {
    this.width = width;
};
Turtle.prototype.setColorRgb = function(r, g, b) {
    this.color = Raphael.rgb(r, g, b);
};
Turtle.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
    this.updateTurtle();
};
Turtle.prototype.setHeading = function(a) {
    this.angle = a;
    this.updateTurtle();
};
Turtle.prototype.drawTo = function (x, y) {
    var x1 = this.x;
    var y1 = this.y;
    var params = {
        "stroke-width": this.width,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke": this.color,
        "stroke-opacity": this.opacity
    };
    var path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
        x1, y1, x, y)).attr(params);

	return this;
};
Turtle.prototype.forward = function (d) {
    var newx = this.x + Math.cos(Raphael.rad(this.angle)) * d;
    var newy = this.y - Math.sin(Raphael.rad(this.angle)) * d;
    if(this.pen) {
        this.drawTo(newx, newy);
    }
    this.x = newx;
    this.y = newy;
    this.updateTurtle();
};
Turtle.prototype.right = function (ang) {
    this.angle -= ang;
    this.updateTurtle();
};
Turtle.prototype.left = function (ang) {
    this.angle += ang;
    this.updateTurtle();
};
Turtle.prototype.penup = function () {
    this.pen = false;
};
Turtle.prototype.pendown = function () {
    this.pen = true;
};
Turtle.prototype.home = function() {
    this.setPosition(this.originx, this.originy);
};
Turtle.prototype.assignEnv = function(env){
	var turtle = this;
	add_binding(env, 'forward', simpleFunCombinator(function(d) { turtle.forward(d);	}));
	add_binding(env, 'right', simpleFunCombinator(function(a) { turtle.right(a);	}));
	add_binding(env, 'left', simpleFunCombinator(function(a) { turtle.left(a); }) );
	add_binding(env, 'setOpacity', simpleFunCombinator(function(d) { turtle.setOpacity(d); }) );
	add_binding(env, 'setWidth', simpleFunCombinator(function(w) { turtle.setWidth(w); }) );
	add_binding(env, 'setColorRgb', simpleFunCombinator(function(r, g, b) { turtle.setColorRgb(r, g, b); }) );
	add_binding(env, 'setColor', simpleFunCombinator(function(c) { turtle.color = c; }) );
	add_binding(env, 'setPosition', simpleFunCombinator(function(x, y) { turtle.setPosition(x, y); }) );
	add_binding(env, 'setHeading', simpleFunCombinator(function(a) { turtle.setHeading(a); }) );
	add_binding(env, 'home', simpleFunCombinator(function() { turtle.home(); }) );
}

// Predifined operations

var operations = {
	'<' : { 
		type:'binary', 
		fun:function(left, right){ return left < right; } 
	},
	'>' : { 
		type:'binary', 
		fun:function(left, right){ return left > right; } 
	},
	'+' : {
		type:'binary',
		fun:function(left, right) { return left + right; }
	},
	'*' : {
		type:'binary',
		fun:function(left, right) { return left * right; }
	},
	'-' : {
		type:'binary',
		fun:function(left, right) { return left - right; }
	},
	'/' : {
		type:'binary',
		fun:function(left, right) { return left / right; }
	}
};

// AUX - bindings

var add_binding = function (env, v, val) {
    env.bindings[v]=val;
    return env;
}; 

var lookup = function (env, v) { 
    if(!env || !env.bindings){
        throw 'Couldnt find ' + v + ' in env!';
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
		if(env.bindings[v] != undefined && typeof env.bindings[v] !== typeof val)
			throw 'You cant store values in a slot that contains a value of another type! I wont let you!';

		env.bindings[v] = val;
		return;
	}

	update(env.outer, v, val);
};


// This is global :( because createTurtle needs to know about the graphic env
var graphicsEnv = undefined;

// Turtles are stored in the env

// TORTOISE EVALUATION
var initial_functions = {
	'random' : simpleFunCombinator(function(){ return Math.random(); }),
	'randomInterval' : simpleFunCombinator(function(min, max){ mylog("Called randomInterval("+min+", "+max+")"); return Math.random() * (max - min) + min; })
};

var env = { bindings: initial_functions };

// TODO
var createTurtle = function(name, color, originx, originy, env, grapEnv){
	var newTurtle = new Turtle(name, color, { x: originx, y : originy });

	// Add to graphics env (without assignEnv !!!)
	grapEnv.addTurtle(newTurtle).init();

	// Add turtle to env
	add_binding(env, newTurtle.name, newTurtle);
	
	return newTurtle;
};


// Thunked
function evalTyped(expr, resolved, env, cont, xcont){
	switch(resolved.type){
		case 'binary':
			return thunk(evalExpr, expr.left, env, 
					function(a1){
						return thunk(evalExpr, expr.right, env, 
							function(a2){
								return thunk(cont, resolved.fun(a1, a2));
							}
						, xcont)
					}
					, xcont);
		default:
			throw 'Unknown type of operation: ' + resolved.type;
	}
}


// Thunked
function evalExpr(expr, env, cont, xcont){
	if(expr == undefined)
		throw 'expr is undefined!';

	if(typeof expr === 'number'){
		return thunk(cont, expr);
	}

	if(typeof expr === 'string'){
		return thunk(cont, lookup(env, expr));
	}
	
	var typed = operations[expr.tag];
	if(typed){
		return evalTyped(expr, typed, env, cont, xcont);
	}

	switch(expr.tag){
		case 'call':
				// Get function value
				var func = lookup(env, expr.name);
				// Evaluate arguments to pass
				var ev_args = [];
				var i = 0;
				for(i = 0; i < expr.args.length; i++) {
					ev_args[i] = evalExpr(expr.args[i], env, thunkValue, xcont);
				}
				mylog("DBG " + expr.name + " = " + func.toString());
				mylog(ev_args);
				//return func.apply(null, ev_args);

				return thunk(func, ev_args, env, cont, xcont);

				
		case 'ident':
				// return lookup(env, expr.name);
	        	return evalExpr(expr.name, env, cont, xcont); 
	}

	throw 'Unexpected expression (' + expr.tag + ')';
}



// This is the main entry point, not evalExpr !!!!
// TODO ALMOST Thunked
var evalStatement = function (stmt, env, cont, xcont) {
    var val = undefined;
    switch(stmt.tag) {
        case 'ignore':
            // f(1+1);, 1+1; ,.... 
            return thunk(evalExpr, stmt.body, env, cont, xcont);
        case 'var':
            // Var Name;
            //add_binding(env, stmt.name, 0);
            //return 0;
				return thunk(
						function(env, v, val){
							// A wrapper fot the add_binding function, which returns the new env. Not necessary :|
							mylog("Running add_binding!");
							add_binding(env, v, val); 
							return thunk(cont, 0); 
						}, env, stmt.name, 0);
        case ':=':
            // Left := Right
				//val = evalExpr(stmt.right, env);
				//update(env, stmt.left, val);
				//return val;
				mylog("Returning thunk for update...");
				return thunk(evalExpr, stmt.right, env, 
						function(right){
							mylog("Running update!");
							mylog(env);
							update(env, stmt.left, right);
							mylog(env);
							return thunk(cont, 0);
						}, xcont);
        case 'if':
				// if( Expr ) { Body ... }
				//if(evalExpr(stmt.expr, env)) {
            //	val = evalStatements(stmt.body, env);
				//}
				//return val;
				return thunk(evalExpr, stmt.expr, env, 
						function(cond){
							if(cond){
								val = evalFullStatements(stmt.body, env, cont, xcont);
							}
							return thunk(cont, val);
						}, xcont);
        case 'repeat':
				// repeat( Expr ) { Body ... }
            /*var times = evalExpr(stmt.expr, env);
            var val = null;
            while(times--){
                val = evalStatements(stmt.body, env);
            }
            return val;*/

				return thunk(evalExpr, stmt.expr, env, 
						function(times){
							mylog("Entered repeat (" + times + ")");
							var val = null;
							while(times--){
								mylog(times + "times more ...");
								val = evalFullStatements(stmt.body, env);
							}
							return thunk(cont, val);
						}, xcont);
        case 'with':
				/*
				var turtle = lookup(env, stmt.expr);
				if (turtle.constructor !== Turtle)
					throw 'No such turtle ' + stmt.expr;
			
				var new_bindings = {};
				var new_env = { bindings: new_bindings, outer: env};

				turtle.assignEnv(new_env);

				return evalStatements(stmt.body, new_env);	*/		
        case 'define':
		     /*var new_func = function() {		         
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
		     return 0;*/
				return thunk(
						function(){
							var new_func = function(args, env, cont, xcont) {		         
								var i;
								var new_env;
								var new_bindings;
								new_bindings = { };
								for(i = 0; i < stmt.args.length; i++) {
									 new_bindings[stmt.args[i]] = trampoline(args[i]);
								}

								// Add to future env
								new_env = { bindings: new_bindings, outer: env };

								return cont( evalFullStatements(stmt.body, new_env) );
							};
							// Add to current env
							add_binding(env, stmt.name, new_func);

							return thunkValue(0);
						});
        case 'turtle':
  				/*
				var ev_args = stmt.args;

				ev_args.push(env);
				ev_args.push(graphicsEnv);
				createTurtle.apply(null, ev_args);

				return 0;
				*/
				return thunk(
						function(e, g){
							createTurtle(e, g);
							return thunkValue(0);
						}, env, graphicsEnv);
    }

	if(stmt.tag == undefined)
		throw 'without tag in ' + JSON.stringify(stmt)
	else
		throw 'tag ' + stmt.tag + ' is not implemented!';
};


var evalStatements = function (seq, env, cont, xcont) {
    var i;
    var val = undefined;
    for(i = 0; i < seq.length; i++) {
        val = evalStatement(seq[i], env, cont, xcont);
    }
    return val;
};

// CPS -------------

/*
 Create a thunk for a function and its arguments
*/
var thunk = function (f) {
	if(f == undefined)
		throw 'Please do not create a thunk without a function!!!';

	var args = Array.prototype.slice.call(arguments);
	args.shift();
	return { tag: "thunk", func: f, args: args };
};

/*
 Create a thunk for a value
*/
var thunkValue = function (x) {
    return { tag: "value", val: x };
};

/*
 Trampoline for evaluation of a thunk
*/
var trampoline = function (thk) {
	while (true) {
		if(thk == undefined)
			throw 'thk undefined at trampoline()';


		if (thk.tag === "value") {
			return thk.val;
		} else if (thk.tag === "thunk") {
			thk = thk.func.apply(null, thk.args);
		} else {
			mylog("BAD THUNK!");
			mylog(thk);
			throw new Error("Bad thunk");
		}
	}
};

/*
 Setup an aux structure for step-by-step evaluation
*/
var stepStart = function (expr, env, cont, xcont) {
	var ret = { 
		data: evalStatement(expr, env, cont, xcont),
		done: false
	};	
	return ret;
};

/*
  Wrapper for evaluating an expression, step by step
*/
var evalFull = function (expr, env) {
    var state = stepStart(expr, env, thunkValue, thunkValue);
    while(!state.done) {
        step(state);
    }
    return state.data;
};


var evalFullStatements = function(stats, env){
    var i;
    var val = undefined;
    for(i = 0; i < stats.length; i++) {
        val = evalFull(stats[i], env);
    }
    return val;
}

/*
 Wrapper for evaluating two parallel expressions
*/
var evalTwo = function (expr0, expr1, env) {
    var state0 = stepStart(expr0, env);
    var state1 = stepStart(expr1, env);
        
    while(true) {
        if(!state0.done)
            step(state0);
        if(!state1.done)
            step(state1);
        if(state0.done && state1.done)
            return;
    }
};

var step = function(state){

	var thk = state.data;
	if(thk == undefined)
		throw 'thk undefined at step(...)';

	if (thk.tag === "value") {        
		state.data = thk.val;
		state.done = true;

		return state;
	} else if (thk.tag === "thunk") {
		state.data = thk.func.apply(null, thk.args);
		state.done = false;

		return state;
	} else {
		mylog("BAD THUNK!");
		mylog(state);
		mylog(thk);
		throw new Error("Bad thunk");
	}

}


var i = 0;
var traced = {};
var trace = function(funname){
	var tmp = eval(funname);

	traced[funname] = tmp;

	eval("(" + funname + " = " + 
				function(){
						var args = Array.prototype.slice.call(arguments);
						i+=1;
						mylog("TRACE[" + i + "]: enter " + funname + " (")
						mylog(args);
						mylog(")")
						var res = tmp.apply(null, args);						
						mylog("TRACE[" + i + "]: exit  " + funname + " = ");
						mylog(res);
						i-=1;
						return res;
					} + ")");
}

var mylog = function(stuff){
	//console.log(stuff);
}

/*
trace("stepStart");
trace("evalExpr");
trace("evalStatement");
trace("evalFull");
trace("evalFullStatements");
trace("step");*/
