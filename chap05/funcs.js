var lookup = function (env, v) {
    if(!env || !env.bindings){
        return null;
    }
    
    if(env.bindings.hasOwnProperty(v)){
        return env.bindings[v];
    }
    
    return lookup(env.outer, v);
};

