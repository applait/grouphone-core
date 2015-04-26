#!/usr/bin/env node

var express = require("express"),
    https = require("https"),
    fs = require("fs"),
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
global.utils = require("./libs/utils");

// Hide the X-Powered-By Header
app.use(function (req, res, next) {
  res.setHeader("X-Powered-By", "Grouphone");
  next();
});

// Configure application
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(config.SALT));

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
  req.csrfToken = utils.csrfToken();
  next();
});

// Register routes
app.use("/", express.static(path.join(__dirname, "static")));
app.use("/", require("./libs/routes"));

// Set https options
var https_options = {
  key: fs.readFileSync(config.SSL_KEY),
  cert: fs.readFileSync(config.SSL_CERT),
  passphrase: config.SSL_PASSPHRASE
};

// Disable TLS authorization check so that we can use self-signed cert for the Grouphone API
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Start the secure server
var server = https.createServer(https_options, app).listen(config.APP_PORT, config.APP_IP, function () {
  console.log("Starting Grouphone Web client secure server...");
  console.log("Listening on %s:%d", config.APP_IP, config.APP_PORT);
});
