#!/usr/bin/env node

var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    config = require("./config"),
    db = require("./db");

var app = express();

// Override port from third commandline argument, if present
if (process.argv && process.argv[2]) {
    config.APP_PORT = parseInt(process.argv[2]);
}

// Set useful globals
global.db = db,
global.config = config;

// Configure application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, 'static')));

// Register routes
app.use("/api", require("./api/api"));
app.use("/app", require("./api/app"))
app.use('/auth', require("./api/auth"));

// Start the server
var server = app.listen(config.APP_PORT, config.APP_IP, function () {
    console.log("Starting Grouphone...");
    console.log("Listening on port %s:%d", config.APP_IP, config.APP_PORT);
});
