/**
 * Core API request handler
 */

var router = require("express").Router();

router.get("/", function (req, res) {
  res.status(406).json({ "message": "Hello, multiverse!" });
});

router.use("/login", require("./login"));
router.use("/logout", require("./logout"));
router.use("/verify", require("./verify"));
router.use("/forgot", require("./forgot"));
router.use("/passwd", require("./passwd"));
router.use("/activate", require("./activate"));
router.use("/sendinvite", require("./sendinvite"));
router.use("/requestinvite", require("./requestinvite"));

module.exports = router;
