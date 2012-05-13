var Turtle = function (id) {
    var $elem = $('#' + id);
    this.paper = Raphael(id);
    this.originx = $elem.width() / 2;
    this.originy = $elem.height() / 2;
    this.clear();
};
Turtle.prototype.clear = function () {
    this.paper.clear();
    this.x = this.originx;
    this.y = this.originy;
    this.angle = 90;
    this.width = 4;
    this.opacity = 1.0;
    this.color = '#00f';
    this.pen = true;
    this.turtleimg = undefined;
    this.updateTurtle();
};
Turtle.prototype.updateTurtle = function () {
    if(this.turtleimg === undefined) {
        this.turtleimg = this.paper.image(
            "livetest_files/turtle2.png",
            0, 0, 64, 64);
    }
    this.turtleimg.attr({
        x: this.x - 32,
        y: this.y - 32,
        transform: "r" + (-this.angle)});
    this.turtleimg.toFront();
};
Turtle.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
};
Turtle.prototype.setWidth = function(width) {
    this.width = width;
};
Turtle.prototype.setColor = function(r, g, b) {
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
	add_binding(env, 'forward', function(d) { this.forward(d); });
	add_binding(env, 'right', function(a) { this.right(a); });
	add_binding(env, 'left', function(a) { this.left(a); });
}

// Predifined operations

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

var env = { bindings:{} };

function evalTyped(expr, resolved, env){
	switch(resolved.type){
		case 'binary':
			return resolved.fun(
					evalExpr(expr.left),
					evalExpr(expr.right));
		default:
			throw 'Unknown type of operation: ' + resolved.type;
	}
}

var add_binding = function (env, v, val) {
    env.bindings[v]=val;
    return env;
}; 

var lookup = function (env, v) { 
    if(!env || !env.bindings){
        throw 'Couldnt find ' + v + '!';
    }
    
    if(env.bindings.hasOwnProperty(v)){
        return env.bindings[v];
    }
    
    return lookup(env.outer, v);
};


function evalExpr(expr, env){
	if(typeof expr === 'number'){
		return expr;
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

