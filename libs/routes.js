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

/**
 * Decrypt encrypted AES password string
 *
 * @param {string} pwstring - A string built by URI encoding of comma-separated concatenation of the
 * `ciphertext`, `key` and `iv` of a string encypted using AES-256-CBC.
 */
var decryptAES = function (pwstring) {
  var dec = "";
  pwstring = decodeURIComponent(pwstring).split(",");
  if (pwstring.length === 3) {
    try {
      var decipher = crypto.createDecipheriv("aes-256-cbc",
                                           new Buffer(pwstring[1], "base64"),
                                           new Buffer(pwstring[2], "base64"));
      dec = decipher.update(new Buffer(pwstring[0], "base64"), "base64", "utf8");
      dec += decipher.final("utf8");
    } catch (e) {
      console.log("Unable to decrypt");
      return "";
    }
  }
  return dec;
};

// The landing page of the website
router.get("/", function (req, res) {
  res.status(200).sendFile(approot + "static/index.html");
});

// The landing page of the webapp
router.get("/app", auth, function (req, res) {
  res.render("app", { user: req.user });
});

// For a get request, send the sign-in page
router.get("/login", noauth, function (req, res) {
  res.render("login", { user: null, csrfToken: req.csrfToken });
});

// For a post request, process the given payload
// Send user the /app page on successful login
router.post("/login", noauth, csrfVerify, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim();
  var password = req.body && req.body.password && req.body.password.trim();

  if (!email || !password) {
    return res.status(401).json({ message: "Login failed; malformed request." });
  }

  password = hash(decryptAES(password));

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
        res.status(200).json({});
      } else {
        if (err) console.log("Error", err);
        res.status(403).json({ message: "Login failed" });
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
  var user = req.user || {};
  if (!user.email) {
    user.email = crypto.randomBytes(2).toString("hex") + "@guest.grouphone.me";
  }
  res.render("call", { sessionid: req.params.sessionid, user: user });
});

router.post("/forgot", noauth, csrfVerify, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim();

  if (!email) {
    return res.status(401).json({ message: "Need email." });
  }

  // Query the forgot API
  request.post(
    { url: apibase + "/api/forgot",
      form: { email: email }},
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // User credentials matched. Create session. Redirect to app landing page.
        body = JSON.parse(body);
        res.status(200).json({ message: "success" });
      } else {
        // User did not match. Redirect back to login page with error message.
        if (err) console.log("Error", err);
        res.status(403).json({ message: "User not found."});
      }
    });
});

router.get("/activate/:token", noauth, function (req, res) {

  // Query to see if token is valid API
  request.get(
    { url: apibase + "/api/passwd/" + req.params.token },
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // Token matched, show activate view
        body = JSON.parse(body);
        res.render("activate", { user: body, csrfToken: req.csrfToken });
      } else {
        // Token did not match. Show error view
        if (err) console.log("Error", err);
        res.render("activate", { user: null, csrfToken: req.csrfToken });
      }
    });
});

router.post("/activate", noauth, csrfVerify, function (req, res) {

  var email = req.body && req.body.email && req.body.email.trim();
  var token = req.body && req.body.token && req.body.token.trim();
  var password = req.body && req.body.password && req.body.password.trim();

  if (!email || !token || !password) {
    return res.status(401).json({ message: "Activation failed; malformed request." });
  }

  // Query to see if token is valid API
  request.post(
    { url: apibase + "/api/passwd/",
      form: { email: email, token: token, password: hash(decryptAES(password)) }},
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // Token matched send success
        body = JSON.parse(body);
        res.status(200).json({});
      } else {
        // Token did not match. Respond with error message.
        if (err) console.log("Error", err);
        res.status(403).json({ message: "Activation failed; wrong credentials." });
      }
    });
});

module.exports = router;
