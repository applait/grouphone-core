/**
 * Methods to trap call handlers in mobile devices
 */

var router = require("express").Router();

router.get("/", function (req, res) {
  res.render("callhandler");
});

module.exports = router;
