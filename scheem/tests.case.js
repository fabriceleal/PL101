[	
	{
		"test" : "(a b c)",
		"expected" : ["a", "b", "c"]
	},
	{
		"test" : "a",
		"expected" : "a"
	},
	{
		"test" : "123",
		"expected" : "123"
	},
	{
		"test" : "(a b (c (e f)))",
		"expected" : ["a", "b", ["c", ["e", "f"]]]
	},
	{
		"test" : "(a  b  c)",
		"expected" : ["a", "b", "c"]
	},
	{
		"test" : "(  a  b  c  )",
		"expected" : ["a", "b", "c"]
	},
	{
		"test" : "(\ta\tb\tc)",
		"expected" : ["a", "b", "c"]
	}
]
