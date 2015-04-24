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
router.use("/app", require("./app.js"));
router.use("/login", require("./login.js"));
router.use("/logout", require("./logout.js"));
router.use("/call", require("./call.js"));
router.use("/join", require("./join.js"));
router.use("/forgot", require("./forgot.js"));
router.use("/activate", require("./activate.js"));

module.exports = router;
