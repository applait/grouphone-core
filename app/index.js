/**
 * Application API handler
 */

var router = require("express").Router();

// For a get request, send the sign-in page
router.get("/", function (req, res) {
    res.status(200).sendFile(approot + "static/index.html");
});

module.exports = router;
