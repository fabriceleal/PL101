
final: parser.js

parser.js: scheem.pegs build.js
	./build.js > parser.js

.PHONY: clean
clean:
	rm parser.js

.PHONY: deploy
deploy:
	cp parser.js tests/
