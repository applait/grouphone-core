/**
 * Application request handlers
 * Returns views for every request
 */

var router = require("express").Router(),
    request = require("request"),
    apibase = "http://" + config.API_HOSTNAME + ":" + config.API_PORT,
    crypto = require("crypto");

var hash = function (string) {
  return crypto.createHmac("sha1", config.SALT).update(string).digest("hex");
};

// The landing page of the website
router.get("/", function (req, res) {
  res.status(200).sendFile(approot + "static/index.html");
});

// The landing page of the webapp
router.get("/app", auth, function (req, res) {
  res.render("app");
});

// For a get request, send the sign-in page
router.get("/login", noauth, function (req, res) {
  res.render("login");
});

// For a post request, process the given payload
// Send user the /app page on successful login
router.post("/login", noauth, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim();
  var password = req.body && req.body.password && req.body.password.trim();

  if (!email || !password) {
    return res.redirect("/login?failed=1");
  }
  password = hash(password);

  // Query the login API
  request.post(
    { url: apibase + "/api/login",
      form: { email: email, password: password }},
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // User credentials matched. Create session. Redirect to app landing page.
        body = JSON.parse(body);
        // Store cookie for 30 days
        res.cookie("gp_email", body.email, { maxAge: 2592000000, signed: true });
        res.cookie("gp_token", body.token, { maxAge: 2592000000, signed: true });
        res.redirect("/app");
      } else {
        // User did not match. Redirect back to login page with error message.
        if (err) console.log("Error", err);
        res.redirect("/login?failed=1");
      }
    });
});

router.get("/logout", function (req, res) {
  if (req.user) {
  request.get(
    apibase + "/api/logout",
    { qs: { email: req.user.email, token: req.user.token }},
    function (err, response, body) {
      if (err) return res.redirect("/app");
      if (response.statusCode == 200) {
        res.clearCookie("gp_email", { signed: true });
        res.clearCookie("gp_token", { signed: true });
        res.redirect("/");
      }
    });
  } else {
    res.clearCookie("gp_email", { signed: true });
    res.clearCookie("gp_token", { signed: true });
    res.redirect("/");
  }
});

router.get("/call", auth, function (req, res) {
  res.render("call", { sessionid: null, user: req.user });
});

router.get("/join/:sessionid", function (req, res) {
  var email = crypto.randomBytes(2).toString("hex") + "@guest.grouphone.me";
  res.render("call", { sessionid: req.params.sessionid, user: { email: email } });
});

router.post("/forgot", noauth, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim();

  if (!email) {
    return res.status(402).json({ message: "Need email." });
  }

  // Query the forgot API
  request.post(
    { url: apibase + "/api/forgot",
      form: { email: email }},
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // User credentials matched. Create session. Redirect to app landing page.
        body = JSON.parse(body);
        res.status(200).json({ message: body });
      } else {
        // User did not match. Redirect back to login page with error message.
        if (err) console.log("Error", err);
        res.status(403).json({ message: "User not found."});
      }
    });
});

router.get("/forgot/:token", noauth, function (req, res) {

  // Query to see if token is valid API
  request.get(
    { url: apibase + "/api/passwd/" + req.params.token },
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // Token matched show activate view
        body = JSON.parse(body);
        res.render("resetpassword", { user: body });
      } else {
        // Token did not match. Redirect back to login page with error message.
        if (err) console.log("Error", err);
        res.redirect("/login?activate=failed");
      }
    });
});

router.post("/forgot/:token", noauth, function (req, res) {

  var email = req.body && req.body.email && req.body.email.trim();
  var token = req.body && req.body.token && req.body.token.trim();
  var password = req.body && req.body.password && req.body.password.trim();

  if (!email || !token || !password) {
    return res.redirect("/login");
  }

  // Query to see if token is valid API
  request.post(
    { url: apibase + "/api/passwd/",
      form: { email: email, token: token, password: hash(password) }},
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // Token matched show activate view
        body = JSON.parse(body);
        res.redirect("/login?reset=1");
      } else {
        // Token did not match. Redirect back to login page with error message.
        if (err) console.log("Error", err);
        res.redirect("/login?reset=failed");
      }
    });
});

module.exports = router;
