var prettyType = function (type) {
    if(!type.hasOwnProperty('tag'))
        throw new Error('Arg doesnt have tag!');
    
    switch(type.tag){
        case 'basetype':
            return type.name;
        case 'arrowtype':
            return '(' + prettyType(type.left) + ' -> ' + prettyType(type.right) +')';
    }
    
    throw new Error('Unexpected tag: ' + type.tag);
};
