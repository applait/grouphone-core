var request = require("request"),
    apibase = "http://" + config.API_HOSTNAME + ":" + config.API_PORT;

module.exports = {
  auth: function (req, res, next) {
    if (req.user && req.user.email && req.user.token) {
      request(apibase + "/api/verify/" + req.user.email + "/" + req.user.token, function (err, resp, body) {
        if (err) {
          console.log("error", err);
          return res.redirect("/logout");
        }
        if (resp.statusCode == 200) {
          body = JSON.parse(body);

          if (body.session) {
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
  }
};
