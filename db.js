/**
 * Adapter to different storage units
 */

var levelup = require("levelup");

module.exports = {
    invites: levelup("./storage/invites.db", {
        keyEncoding: "json",
        valueEncoding: "json"
    })
};
