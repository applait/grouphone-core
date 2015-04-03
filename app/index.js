/**
 * Application request handlers
 * Returns views for every request
 */

var router = require("express").Router();

// The landing page of the website
router.get("/", function (req, res) {
    res.status(200).sendFile(approot + "static/index.html");
});

// The landing page of the webapp
router.get("/app", function (req, res) {
    res.render("app");
});

// For a get request, send the sign-in page
router.get("/login", function (req, res) {
    res.render("login");
});

// For a post request, process the given payload
// Send user the /app page on successful login
router.post("/login", function (req, res) {
    res.status(200).redirect("/app");
});

module.exports = router;
