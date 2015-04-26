var router = require("express").Router(),
    request = require("request");

router.get("/", function (req, res) {
  if (req.user) {
  request.get(
    config.API_PATH + "/logout",
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

module.exports = router;
