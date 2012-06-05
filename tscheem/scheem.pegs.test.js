#!/usr/local/bin/node

var pegs = require('pegjs');
var assert = require('assert');
var fs = require('fs');


fs.readFile('scheem.pegs', 'utf-8', function(err, data){
	if(err) throw err;

	// Build parser
	var parse = pegs.buildParser(data).parse;
	
	// Get files in dir
	fs.readdir('.', function(err, data){
		data.forEach(function(item){
			// Filter test files (end with .case.json)
			if(item.match("^.*\\\.case\\\.json$")){
				// Read and run each file
				fs.readFile(item, 'utf-8', function(err, data){
					//console.log(data);

					// Parse file content as json
					var compiled = JSON.parse(data);
					var run = 0, succeded = 0;
					
					// Run test with each elem
					compiled.forEach(function(test, idx){
						try{
							console.log('Running test ' + idx + ' of ' + item);
							run=run+1;
							var parsed = parse(test.test);
							try{
								// Deep equal handles passively numbers vs strings
								if(typeof parsed !== typeof test.expected){
									// I know this will fail, but I want a verbose exception!
									assert.strictEqual(parsed, test.expected);
								}else{
									assert.deepEqual(parsed, test.expected);
								}

								succeded=succeded+1;
							}catch(err){
								console.error('Failed test #' + idx + ' of file ' + item);
								console.error(err);
							}
						}catch(err2){
							console.warn('Error parsing ' + test.test);
							console.warn(err2);
						}						
					});

					console.log('Test file: ' + item);
					console.log('Tests run: ' + run);
					console.log('Succeded : ' + succeded + ' (' + ( run == 0? 'NA' : succeded / (run*1.0) * 100.0 + '%') + ')');
				});							
			}
		});
	});
});

