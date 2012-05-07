var evalScheemString = function(str, env){
	var tree = SCHEEM(str);
	return evalScheem(tree, env);
};
