/**
 * Application request handlers
 * Returns views for every request
 */

var router = require("express").Router(),
    request = require("request"),
    apibase = "http://" + config.API_HOSTNAME + ":" + config.API_PORT;

// The landing page of the website
router.get("/", function (req, res) {
  res.status(200).sendFile(approot + "static/index.html");
});

// The landing page of the webapp
router.get("/app", function (req, res) {
  res.render("app");
});

// For a get request, send the sign-in page
router.get("/login", function (req, res) {
  res.render("login");
});

// For a post request, process the given payload
// Send user the /app page on successful login
router.post("/login", function (req, res) {
  // Query the login API
  request.post(
    { url: apibase + "/api/login",
      form: { email: req.body.email, password: req.body.password }},
    function (err, response, body) {
      if (!err && response.statusCode == 200) {
        // User credentials matched. Create session. Redirect to app landing page.
        console.log(JSON.parse(body));
        res.redirect("/app");
      } else {
        // User did not match. Redirect back to login page with error message.
        console.log("Response status: ", response.statusCode);
        console.log("Response body: ", JSON.parse(body));
        if (err) console.log("Error", err);
        res.redirect("/login?failed=1");
      }
    });
});

module.exports = router;
