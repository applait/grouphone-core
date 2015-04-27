/**
 * This module provides utility functions for the entire application.
 *
 * It is exposed as the global `utils` by `server.js`. This has access to the global `config` object.
 */

var request = require("request"),
    csrflib = require("csrf")(),
    crypto = require("crypto");

module.exports = {

  /**
   * Middleware function to let only authenticated users access those routes.
   *
   * This middleware verifies user sessions with the Grouphone API based on the user email and token available
   * in the current request.
   *
   * If the request is found as a valid session, it calls `next()` to let the rest of the request process. Otherwise,
   * it sends user to the login page. If any error is encountered, it forces user to go through logout.
   *
   * Example usage in a route:
   *
   * ```
   * route.get("/app", utils.auth, function (req, res) {
   *   // Authenticated by this time
   * });
   * ```
   */
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


  /**
   * Middleware function to let only non-authenticated users access those routes.
   *
   * This is the exact opposite of `utils.auth`. If user information is set in current request, it sends the user
   * to `/app`.
   *
   * Example usage in a route:
   *
   * ```
   * route.get("/login", utils.noauth, function (req, res) {
   *   // Non-authenticated user. Do stuff here
   * });
   * ```
   */
  noauth: function (req, res, next) {
    if (req.user && req.user.email && req.user.token) {
      return res.redirect("/app");
    }
    next();
  },


  /**
   * Middleware function to verify CSRF token
   *
   * It uses the `csrf` module to verify the token provided. It expects the CSRF token to be passed in `req.body.csrf`.
   *
   * Example usage in a route:
   *
   * ```
   * route.post("/forgot", utils.csrfVerify, function (req, res) {
   *   // CSRF verified by now. Do stuff.
   * });
   * ```
   */
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


  /**
   * Generate a new CSRF token.
   *
   * It uses the `csrf` module to create a new token using salt specified in `config.SALT`.
   *
   * A middleware in server.js uses this function to set `req.csrfToken` for all requests.
   *
   * @return {string}
   */
  csrfToken: function () {
    return csrflib.create(config.SALT);
  },


  /**
   * Generate a SHA-1 of a given string using `config.SALT` as the salt.
   *
   * @param {string} string - Any string in the world
   * @return {string} - The SHA-1 string.
   */
  hash: function (string) {
    return crypto.createHmac("sha1", config.SALT).update(string).digest("hex");
  },


  /**
   * Decode a URI-encoded base64 string to get its hex value
   *
   * @param {string} string - A URI-encoded base64 string
   * @return {string} - The decoded string
   */
  base64decode: function (string) {
    return new Buffer(decodeURIComponent(string), "base64").toString("hex");
  }

};
