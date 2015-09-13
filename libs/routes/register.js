/**
 * User register route
 */
var router = require("express").Router(),
    request = require("request");

// For a get request, send the register page
router.get("/", utils.noauth, function (req, res) {
  res.render("register", { user: null, csrfToken: req.csrfToken });
});

// For a post request, perform the necessary things
router.post("/", utils.noauth, utils.csrfVerify, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim(),
      body;

  if (!email) {
    return res.status(401).json({ message: "Need email." });
  }

  // Query the forgot API
  request.post(
    { url: config.API_PATH + "/user/create",
      form: { email: email, sendEmail: true }},
    function (err, response, body) {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = { message: "Server error.", status: 500 };
      }
      console.log("Registration: Email: %s, Status: %s", email, body.message);
      res.status(body.status).json({ message: body.message });
    });
});

module.exports = router;
