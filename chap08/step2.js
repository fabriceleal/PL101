var step = function (state) {
    
    var thk = state.data;
    
    if (thk.tag === "value") {        
        state.data = thk.val;
        state.done = true;
        
        return state;
    } else if (thk.tag === "thunk") {
        state.data = thk.func.apply(null, thk.args);
        state.done = false;
        
        return state;
    } else {
        throw new Error("Bad thunk");
    }    
    
};
