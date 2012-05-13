var evalStatement = function (stmt, env) {
    // Statements always have tags
    switch(stmt.tag) {
        // A single expression
        case 'ignore':
            return evalExpr(stmt.body, env);
        // Repeat
        case 'repeat':
            var times = evalExpr(stmt.expr);
            var val = null;
            while(times--){
                val = evalStatements(stmt.body);
            }
            return val;
    }
};
