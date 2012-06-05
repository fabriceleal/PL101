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
