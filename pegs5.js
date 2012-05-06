
start =
    expression

expression =
    atom
  / list_expressions
  
atom =
	chars:validchar+
    {return chars.join("");}
	
space_exp =
	" " rest:expression
    {return rest;}
    
validchar =
	[0-9a-zA-Z_?!+\-=@#$%^&*/.]
    
list_expressions =
	"(" head:expression tail:space_exp* ")"
    { return [ head ].concat(tail); }