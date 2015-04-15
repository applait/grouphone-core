#!/bin/bash


# Strip off the logger
mkdir -p tmp
node ./scripts/regex.js

# Concatenate the js & minify them
./node_modules/uglifyjs/bin/uglifyjs tmp/erizo.js static/js/call.js -o static/js/grouphone.js

# Clean yo' shit
rm -rf tmp
