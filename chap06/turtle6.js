var evalExpr = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Look at tag to see what to do
    switch(expr.tag) {
        case '+':
            return evalExpr(expr.left, env) +
                   evalExpr(expr.right, env);
        case 'ident':
            return lookup(env, expr.name);
    }
};
