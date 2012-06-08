
PROJECT_HOME=~/projects/PL101_Pages/tscheem

final: parser.js type-literal.js

parser.js: scheem.pegs 
	pegjs -e SCHEEM scheem.pegs parser.js
# build.js
#	./build.js > parser.js

type-literal.js: type-literal.pegs 
	pegjs -e typeparser type-literal.pegs type-literal.js
# build-type-literal.js
#	./build-type-literal.js > type-literal.js

.PHONY: clean
clean:
	rm -f parser.js
	rm -f type-literal.js

.PHONY: deploy
# Copy parser, interpreter and tests
deploy:
	cp evalScheemString.js $(PROJECT_HOME)
	cp interpreter.js $(PROJECT_HOME)
	cp parser.js $(PROJECT_HOME)
	cp type-literal.js $(PROJECT_HOME)
	cp tests/*.tests.json $(PROJECT_HOME)

