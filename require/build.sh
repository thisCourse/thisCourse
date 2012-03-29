#!/bin/sh

rm -rf build
mkdir build
touch build/styles.css
node tools/r.js -o build.js
cat build/libs/underscore.js build/libs/requirejs/require.js build/bootloader.js > build/engine.js
cat src/libs/jquery/jquery-ui-1.8.16.custom.css >> build/styles.css
