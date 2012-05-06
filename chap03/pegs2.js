start =
    countrycode

countrycode =
    first:letter second:letter
    	{return ("" + first + second);}
        
letter =
	[a-z]