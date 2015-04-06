var router = require("express").Router();

router.get("/:id", function (req, res) {
    res.status(200).json({});
});

module.exports = router;
