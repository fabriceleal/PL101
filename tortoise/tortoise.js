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
	if(this.turtleimg === undefined) {
		this.turtleimg = this.paper.image(
				"../general/turtle2.png",
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
	add_binding(env, 'forward', function(d) { turtle.forward(d); });
	add_binding(env, 'right', function(a) { turtle.right(a); });
	add_binding(env, 'left', function(a) { turtle.left(a); });
	add_binding(env, 'setOpacity', function(d) { turtle.setOpacity(d); });
	add_binding(env, 'setWidth', function(w) { turtle.setWidth(w); });
	add_binding(env, 'setColorRgb', function(r, g, b) { turtle.setColorRgb(r, g, b); });
	add_binding(env, 'setColor', function(c) { turtle.color = c; });
	add_binding(env, 'setPosition', function(x, y) { turtle.setPosition(x, y); });
	add_binding(env, 'setHeading', function(a) { turtle.setHeading(a); });
	add_binding(env, 'home', function() { turtle.home(); });
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
		if(typeof env.bindings[v] !== 'undefined' && typeof env.bindings[v] !== typeof val)
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
	'random' : function(){ return Math.random(); },
	'randomInterval' : function(min, max){ return Math.random() * (max - min) + min; }
};

var env = { bindings: initial_functions };

var createTurtle = function(name, color, originx, originy, env, grapEnv){
	var newTurtle = new Turtle(name, color, { x: originx, y : originy });

	// Add to graphics env (without assignEnv !!!)
	grapEnv.addTurtle(newTurtle).init();

	// Add turtle to env
	add_binding(env, newTurtle.name, newTurtle);
	
	return newTurtle;
};

function evalTyped(expr, resolved, env){
	switch(resolved.type){
		case 'binary':
			return resolved.fun(
					evalExpr(expr.left, env),
					evalExpr(expr.right, env));
		default:
			throw 'Unknown type of operation: ' + resolved.type;
	}
}

function evalExpr(expr, env){
	if(typeof expr === 'number'){
		return expr;
	}

	if(typeof expr === 'string'){
		return lookup(env, expr);
	}
	
	var typed = operations[expr.tag];
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
            var times = evalExpr(stmt.expr, env);
            var val = null;
            while(times--){
                val = evalStatements(stmt.body, env);
            }
            return val;
        case 'with':
				var turtle = lookup(env, stmt.expr);
				if (turtle.constructor !== Turtle)
					throw 'No such turtle ' + stmt.expr;
			
				var new_bindings = {};
				var new_env = { bindings: new_bindings, outer: env};

				turtle.assignEnv(new_env);

				return evalStatements(stmt.body, new_env);			
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
        case 'turtle':
				// FIXME For now, passed as is
				var ev_args = stmt.args;

				ev_args.push(env);
				ev_args.push(graphicsEnv);
				createTurtle.apply(null, ev_args);

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

