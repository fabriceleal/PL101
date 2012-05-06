start =
    word

word =
    first:upper rest:upper*
        { return ("" + first + rest.join(""))}
  / first:lower rest: lower*
      { return ("" + first + rest.join(""))}

upper =
   [A-Z]
    
lower = 
    [a-z]
