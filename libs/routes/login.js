var router = require("express").Router(),
    request = require("request");

// For a get request, send the sign-in page
router.get("/", utils.noauth, function (req, res) {
  res.render("login", { user: null, csrfToken: req.csrfToken });
});

// For a post request, process the given payload
// Send user the /app page on successful login
router.post("/", utils.noauth, utils.csrfVerify, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim();
  var password = req.body && req.body.password && req.body.password.trim();

  if (!email || !password) {
    return res.status(401).json({ message: "Login failed; malformed request." });
  }

  // Query the login API
  request.post(
    { url: config.API_PATH + "/api/login",
      form: { email: email, password: utils.hash(utils.base64decode(password)) }},
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

module.exports = router;
