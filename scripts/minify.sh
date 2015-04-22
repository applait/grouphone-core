#!/bin/bash


# Strip off the logger
mkdir -p tmp
node ./scripts/regex.js

# Concatenate the js & minify them
./node_modules/uglifyjs/bin/uglifyjs tmp/erizo.js static/js/call.js -o static/js/grouphone.js

# Concatenate utils scripts
./node_modules/uglifyjs/bin/uglifyjs \
    static/js/vendor/core-min.js \
    static/js/vendor/enc-base64-min.js \
    static/js/vendor/hmac-sha1.js \
    static/js/utils.js \
    -o static/js/grouphone-utils.js

# Clean yo' shit
rm -rf tmp
