
start =
    expression

// Any valid expression
expression =
    atom
  / list_expressions

// A sequence of valid chars
atom =
	chars:validchar+
    {return chars.join("");}

// A valid atom with any number of trailing spaces (left and right)
space_atom =
	whitespace* head:atom whitespace*
	{return head;}

// A valid expression with any number of spaces at the front
space_exp =
	whitespace* rest:expression
    {return rest;}
    
// A valid char for an expression
validchar =
	[0-9a-zA-Z_?!+\-=@#$%^&*/.]

// A whitespace
whitespace = 
	[" "|"\t"|"\n"]

// A list of expressions
list_expressions =
	"(" head:space_exp tail:space_exp* whitespace* ")"
    { return [ head ].concat(tail); }
