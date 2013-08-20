package: lib/sandbox.js lib/sandbox/interface.js
	npm install -g

test: package
	jasmine-node test/
