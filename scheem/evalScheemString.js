var evalScheemString = function(str, env){
	var tree = SCHEEM(str);
	return evalScheemExternal(tree, env);
};
