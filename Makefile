
build: clean

	@echo "* Creating a new 'build' directory"
	@mkdir build

	@echo "* Initializing styles.css"
	@> build/styles.css

	@echo "* Compiling require.js modules..."
	@node maketools/r.js -o maketools/build.js

	@echo "* Adding git revision hash to engine.js"
	@printf "\nvar git_revision = \"`git log --pretty=format:'%h' -n 1`\";\n\n" >> build/engine.js

	@echo "* Adding additional libraries to engine.js"
	@cat build/libs/underscore.js build/libs/requirejs/require.js build/bootloader.js >> build/engine.js

	@echo "* Adding jQuery UI css to styles.css"
	@cat src/libs/jquery/jquery-ui-1.8.16.custom.css >> build/styles.css

	@echo "* Copying jQuery images into the build images directory"
	@cp -r src/libs/jquery/images build
	
	@echo

clean:

	@echo "* Deleting old 'build' directory"
	@rm -rf build

install:
	
	@echo "* Installing dependencies..."
	npm install