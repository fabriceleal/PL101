
var prelude = function(expr) {
    return {
        tag: 'seq',
        left: {
            tag: 'note',
            pitch: 'd4',
            dur: 500
        },
        right: expr
    };
};


var reverse = function(expr) {
    if(expr.tag == 'note')
        return expr;
    return {
        tag : expr.tag,
        left : reverse(expr.right),
        right : reverse(expr.left)
    };
};


var endTime = function (time, expr) {
    var totalDuration = function(expr){
        // The duration of a note node is the duration itself
        if(expr.tag=='note' || expr.tag == 'rest')
            return expr.dur;
        
        // The duration of a par node is the maximum of 
        // its children
        if(expr.tag == 'par'){
            var leftside = totalDuration(expr.left);
            var rightside = totalDuration(expr.right);
        
            return leftside > rightside ? leftside : rightside;
        }
	if(expr.tag == 'repeat'){
		return totalDuration(expr.section) * expr.count;
	}
        
        // The duration of a seq node is the sum of the durations
        return totalDuration(expr.left) + totalDuration(expr.right);
    };

    return time + totalDuration(expr);
};

var notes = {
	'a0' : 21,
	'b0' : 23,
	'c1' : 24,
	'd1' : 26,
	'e1' : 28,
	'f1' : 29,
	'g1' : 31,
	'a1' : 33,
	'b1' : 35,
	'c2' : 36,
	'd2' : 38,
	'e2' : 40,
	'f2' : 41,
	'g2' : 43,
	'a2' : 45,
	'b2' : 47,
	'c3' : 48,
	'd3' : 50,
	'e3' : 52,
	'f3' : 53,
	'g3' : 55,
	'a3' : 57,
	'b3' : 59,
	'c4' : 60,
	'd4' : 62,
	'e4' : 64,
	'f4' : 65,
	'g4' : 67,
	'a4' : 69,
	'b4' : 71,
	'c5' : 72,
	'd5' : 74,
	'e5' : 76,
	'f5' : 77,
	'g5' : 79,
	'a5' : 81,
	'b5' : 83,
	'c6' : 84,
	'd6' : 86,
	'e6' : 88,
	'f6' : 89,
	'g6' : 91,
	'a6' : 93,
	'b6' : 95,
	'c7' : 96,
	'd7' : 98,
	'e7' : 100,
	'f7' : 101,
	'g7' : 103,
	'a7' : 105,
	'b7' : 107,
	'c8' : 108
};


var compileT = function(expr, time){
    var ret = [];
    
    if(expr.tag == 'note'){
        ret.push({
            tag : 'note',
            pitch: notes[expr.pitch],
            start: time,
            dur: expr.dur
        });
    }
    if(expr.tag == 'rest'){
	ret.push({
	   tag : 'rest',
	   start: time,
	   dur : expr.dur
	});
    }
    if(expr.tag == 'repeat'){
	for(var i = 0; i < expr.count; i++){
	    var rl = compileT(expr.section, time);
	    time = endTime(time, expr.section);
	    rl.forEach(function(val, idx, arr){ 
		ret.push(val);
	    });
	}
    }
    if(expr.tag == 'par'){
        // Call on left and right with the same starting time
        var l = compileT(expr.left, time); 
        for(var li in l){
            ret.push(l[li]);
        }
        var r = compileT(expr.right, time);
        for(var ri in r){
            ret.push(r[ri]);   
        }
    }
    if(expr.tag == 'seq'){
        var sl = compileT(expr.left, time);
        for(var sli in sl){
            ret.push(sl[sli]); 
        }

        time = endTime(time, expr.left);
                
        var sr = compileT(expr.right, time);
        for(var sri in sr){
            ret.push(sr[sri]);
        }
    }
    
    return ret;
};


var compile = function (musexpr) {
    return compileT(musexpr, 0);
};


var playMUS = function(musexpr){
    return playNOTE(compile(musexpr));
};


/** TESTS **/

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'note', pitch: 'a4', dur: 250 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'note', pitch: 'c4', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));




