// FIXME Assume expressions without trailing spaces

start =
    expression
  / quoted_expression
  / comment

quoted_expression =
        whitespace* "'" stuff:expression whitespace*
    { return ["quote", stuff]; }

// Any valid expression
expression =
    wild_atom
  / list_expressions

// A comment
comment = 
	";;" content:.* "\n"?
	{return []/*[content.join('')]*/;}

// A sequence of valid chars
atom =
	chars:validchar+
    {return chars.join("");}

// A valid atom with any number of trailing spaces (left and right) or comments
wild_atom =
	whitespace* comment* whitespace* head:atom whitespace* whitespace* comment* whitespace*
    {return head;}

// A valid expression with any number of trailing spaces or comments
wild_exp =
	whitespace* comment* whitespace* rest:expression whitespace* comment* whitespace*
    {return rest;}
    
// A valid char for an expression
validchar =
	[0-9a-zA-Z_?!+\-=@#$%^&*/.]

// A whitespace
whitespace = 
	[" "|"\t"|"\n"]

// A list of expressions
list_expressions =
	"(" head:wild_exp tail:wild_exp* ")"
    { return [ head ].concat(tail); }
