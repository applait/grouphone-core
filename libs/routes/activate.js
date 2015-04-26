var router = require("express").Router(),
    request = require("request");

router.get("/:token", utils.noauth, function (req, res) {

  // Query to see if token is valid API
  request.get(
    { url: config.API_PATH + "/passwd/" + req.params.token },
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

router.post("/", utils.noauth, utils.csrfVerify, function (req, res) {

  var email = req.body && req.body.email && req.body.email.trim();
  var token = req.body && req.body.token && req.body.token.trim();
  var password = req.body && req.body.password && req.body.password.trim();

  if (!email || !token || !password) {
    return res.status(401).json({ message: "Activation failed; malformed request." });
  }

  // Query to see if token is valid API
  request.post(
    { url: config.API_PATH + "/passwd/",
      form: { email: email, token: token, password: utils.hash(utils.base64decode(password)) }},
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
