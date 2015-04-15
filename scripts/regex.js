#!/bin/env node

var fs = require("fs");

var flux = fs.readFileSync(__dirname + "/../static/js/vendor/erizo.js").toString();
flux = flux .replace(/L.Logger=[\s\S]+\(L\);/g, "")
            .replace(/:L.Logger.*?[(\)\.)\r\n]?.*?\),?;?/g, ":function(){}")
            .replace(/L.Logger.*?[\r\n]?.*?\),?;?/g, "");

fs.writeFileSync(__dirname + "/../tmp/erizo.js", flux);
