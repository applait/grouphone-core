var router = require("express").Router(),
    request = require("request");

router.post("/", utils.noauth, utils.csrfVerify, function (req, res) {
  var email = req.body && req.body.email && req.body.email.trim();

  if (!email) {
    return res.status(401).json({ message: "Need email." });
  }

  // Query the forgot API
  request.post(
    { url: config.API_PATH + "/requestinvite",
      form: { email: email }},
    function (err, response, body) {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = { message: "Server error.", status: 500 };
      }
      console.log("Invitation: Email: %s, Status: %s", email, body.message);
      res.status(body.status).json({ message: body.message });
    });
});

module.exports = router;
