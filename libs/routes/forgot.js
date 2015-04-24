var router = require("express").Router(),
    request = require("request");

router.post("/", utils.noauth, utils.csrfVerify, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim();

  if (!email) {
    return res.status(401).json({ message: "Need email." });
  }

  // Query the forgot API
  request.post(
    { url: config.API_PATH + "/api/forgot",
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

module.exports = router;
