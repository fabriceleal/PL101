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
		"test" : "(\ta\tb\tc\t)",
		"expected" : ["a", "b", "c"]
	},
	{
		"test" : "(a\n\t(b\n\t\tc\n\t\t(d e f) ) )",
		"expected" : ["a", ["b", "c", ["d", "e", "f"]]]
	},
	{
		"test" : "'a",
		"expected" : ["quote", "a"]
	},
	{
		"test" : "'(a b c)",
		"expected" : ["quote", ["a", "b", "c"]]
	}
]
