var router = require("express").Router();

// The landing page of the webapp
router.get("/", utils.auth, function (req, res) {
  res.render("app", { user: req.user });
});

module.exports = router;
