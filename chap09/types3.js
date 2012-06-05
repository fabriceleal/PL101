var sameType = function (a, b) {
    if(a.tag !== b.tag)
        return false;
    
    switch(a.tag){
        case 'basetype':
            return (a.name === b.name);
        case 'arrowtype':
            return sameType(a.left, b.left) && sameType(a.right, b.right);
    }
    throw new Error('Unexpected!');
};
