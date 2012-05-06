start =
    wordlist

wordlist =
    first:word rest:word_with_space*
    { return [first].concat(rest); }

word = first:letter rest:letter*
    { return ( "" + first + rest.join("")); }

word_with_space = " " rest:word
    { return rest; }

letter = [a-z]