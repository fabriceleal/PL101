

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
        if(expr.tag=='note')
            return expr.dur;
        
        // The duration of a par node is the maximum of 
        // its children
        if(expr.tag == 'par'){
            var leftside = totalDuration(expr.left);
            var rightside = totalDuration(expr.right);
        
            return leftside > rightside ? leftside : rightside;
        }
        
        // The duration of a seq node is the sum of the durations
        return totalDuration(expr.left) + totalDuration(expr.right);
    };

    return time + totalDuration(expr);
};


var compileT = function(expr, time){
    var ret = [];
    
    if(expr.tag == 'note'){
        ret.push({
            tag : 'note',
            pitch: expr.pitch,
            start: time,
            dur: expr.dur
        });
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



