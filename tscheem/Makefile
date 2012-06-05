
PROJECT_HOME=~/projects/PL101_Pages/tscheem

final: parser.js

parser.js: scheem.pegs build.js
	./build.js > parser.js

.PHONY: clean
clean:
	rm parser.js

.PHONY: deploy
# Copy parser, interpreter and tests
deploy:
	cp parser.js $(PROJECT_HOME)
	cp interpreter.js $(PROJECT_HOME)
	cp tests/*.tests.json $(PROJECT_HOME)

