#!/bin/env node

var fs = require("fs");

var flux = fs.readFileSync(__dirname + "/../static/js/vendor/erizo.js").toString();
var fun = "function(){}";
flux = flux.replace(/L.Logger=[\s\S]+\(L\);L=L/, ["L.Logger={info:", fun, ",debug:", fun, ",error:", fun, "};L=L"].join(""))
           .replace(/console.log\([\w\W]+?\)/g, "console.log('You are looking under the hood!')");

fs.writeFileSync(__dirname + "/../tmp/erizo.js", flux);
