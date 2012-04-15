

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
        if(expr.tag=='note')
            return expr.dur;
        return totalDuration(expr.left) + totalDuration(expr.right);
    };
    
    return time + totalDuration(expr);
};


var compileH = function(expr, obj){
    if(expr.tag == 'note'){
        
        obj.compiled.push({
            tag: 'note',
            pitch: expr.pitch,
            start: obj.time,
            dur: expr.dur
        });
        obj.time = obj.time + expr.dur;
        
    }else{
        compileH(expr.left, obj);
        compileH(expr.right, obj);
    }    
    
    return obj.compiled;
};


var compile = function (musexpr) {
    return compileH(musexpr, { compiled: [], time: 0});
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

