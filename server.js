#!/usr/bin/env node

var express = require("express"),
    path = require("path"),
    bodyParser = require("body-parser"),
    cookieParser = require("cookie-parser"),
    config = require("./config");

var app = express();

// Override port from third commandline argument, if present
if (process.argv && process.argv[2]) {
    config.APP_PORT = parseInt(process.argv[2]);
}

// Set useful globals
global.config = config,
global.approot = __dirname + "/";

// Redirect to non-www
app.use(function (req, res, next){
  if (req.headers.host.match(/grouphone\.applait\.com/) !== null) {
    res.redirect('http://' + req.headers.host.replace(/grouphone\.applait\.com/, 'grouphone.me') + req.url);
  } else if (req.headers.host.match(/^www/) !== null ) {
    res.redirect('http://' + req.headers.host.replace(/^www\./, '') + req.url);
  } else {
    next();
  }
});

// Configure application
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.SALT));

// Set middlewares
var authlib = require("./libs/auth");
global.auth = authlib.auth;
global.noauth = authlib.noauth;
global.csrfVerify = authlib.csrfVerify;

// Middleware to populate `req.user` with user information.
// If `req.user` is set with `email` and `token` properties, then the user is logged in.
// For users who are not logged in, `req.user` is set to `null`.
// Set CSRF token per request
app.use(function (req, res, next) {
  var token = req.signedCookies && req.signedCookies.gp_token;
  var email = req.signedCookies && req.signedCookies.gp_email;
  if (token && email) {
    req.user = { email: email, token: token };
  } else {
    req.user = null;
  }
  req.csrfToken = authlib.csrfToken();
  next();
});

// Register routes
app.use("/", express.static(path.join(__dirname, "static")));
app.use("/", require("./libs/routes"));

// Start the server
var server = app.listen(config.APP_PORT, config.APP_IP, function () {
    console.log("Starting Grouphone Web client server...");
    console.log("Listening on port %s:%d", config.APP_IP, config.APP_PORT);
});
