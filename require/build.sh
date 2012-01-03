#!/bin/sh

rm -rf build
mkdir build
touch build/styles.css
node tools/r.js -o build.js
