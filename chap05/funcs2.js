var update = function (env, v, val) {
    if(!env || !env.bindings){
        return;
    }
    
    if(env.bindings.hasOwnProperty(v)){
        env.bindings[v] = val;
        return;
    }
    
    update(env.outer, v, val);
};
