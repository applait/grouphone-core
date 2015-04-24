var router = require("express").Router();

router.get("/", utils.auth, function (req, res) {
  res.render("call", { sessionid: null, user: req.user });
});

module.exports = router;
