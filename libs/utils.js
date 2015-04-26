var request = require("request"),
    csrflib = require("csrf")(),
    crypto = require("crypto");

module.exports = {
  auth: function (req, res, next) {
    if (req.user && req.user.email && req.user.token) {
      request(config.API_PATH + "/verify/" + req.user.email + "/" + req.user.token, function (err, resp, body) {
        if (err) {
          console.log("error", err);
          return res.redirect("/logout");
        }
        if (resp.statusCode == 200) {
          body = JSON.parse(body);

          if (body.session) {
            res.setHeader("Cache-Control", "no-store");
            res.setHeader("Pragma", "no-cache");
            next();
          } else {
            res.redirect("/logout");
          }
        }
      });
    } else {
      res.redirect("/login");
    }
  },

  noauth: function (req, res, next) {
    if (req.user && req.user.email && req.user.token) {
      return res.redirect("/app");
    }
    next();
  },

  csrfVerify: function (req, res, next) {
    if (req.body && req.body.csrf) {
      if (csrflib.verify(config.SALT, req.body.csrf)) {
        next();
      } else {
        return res.status(403).send("CSRF mismatched");
      }
    } else {
      return res.status(403).send("CSRF protected area");
    }
  },

  csrfToken: function () {
    return csrflib.create(config.SALT);
  },

  hash: function (string) {
    return crypto.createHmac("sha1", config.SALT).update(string).digest("hex");
  },

  base64decode: function (string) {
    return new Buffer(decodeURIComponent(string), "base64").toString("hex");
  }

};
