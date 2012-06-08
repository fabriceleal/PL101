var evalScheemString = function(str, env){
	var tree = SCHEEM.parse(str);
	return evalTScheemExternal(tree, env);
};
