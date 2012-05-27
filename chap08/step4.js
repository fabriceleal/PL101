var evalDiv = function (top, bottom, env, cont, xcont) {
    // Here's the code for addition
    // to help you get going.
    return thunk(
        evalExpr, top, env,
        function(v1) {
            return thunk(
                evalExpr, bottom, env,
                function(v2) {
                    if(v2 === 0){
                        return thunk(evalExpr, ['throw'], env, cont, xcont);
                    }
                    return thunk(cont, v1 / v2);
            }, xcont);
    }, xcont);
};
