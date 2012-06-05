var typeExprIf = function (expr, context) {
    if(expr.length !== 4)
        throw new Error('Weird size (' + expr.length +')... ');
        
    if(!sameType(typeExpr(expr[1], context), typeExpr(true, {})))
        throw new Error('Condition expr is not bool!');
    
    var trueBranch = typeExpr(expr[2], context);    
    var falseBranch = typeExpr(expr[3], context);
    
    if(!sameType(trueBranch, falseBranch))
        throw new Error('Types of true and false do not match!');
    
    return trueBranch;
};
