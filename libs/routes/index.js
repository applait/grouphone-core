/**
 * Application request handlers
 * Returns views for every request
 */

var router = require("express").Router();

// The landing page of the website
router.get("/", function (req, res) {
  res.status(200).sendFile(approot + "static/index.html");
});

// Setup routes
router.use("/app", require("./app"));
router.use("/login", require("./login"));
router.use("/logout", require("./logout"));
router.use("/call", require("./call"));
router.use("/join", require("./join"));
router.use("/forgot", require("./forgot"));
router.use("/activate", require("./activate"));
router.use("/invite", require("./invite"));

module.exports = router;
