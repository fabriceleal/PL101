var app2 = function (f){
    return function(x){
        return function(y){
             return f(x)(y);
        };
    };
};
