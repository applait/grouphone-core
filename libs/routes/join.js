var router = require("express").Router(),
    crypto = require("crypto");

router.get("/:sessionid", function (req, res) {
  var user = req.user || {};
  if (!user.email) {
    user.email = crypto.randomBytes(2).toString("hex") + "@guest.grouphone.me";
  }
  res.render("call", { sessionid: req.params.sessionid, user: user });
});

module.exports = router;
