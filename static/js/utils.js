/**
 * Lightweight XHR wrapper
 */
var xhr = function (params, callback) {
  if (typeof params == "string") params = {url: params};
  var headers = params.headers || {},
      body = params.body,
      method = params.method || (body ? "POST" : "GET"),
      withCredentials = params.withCredentials || false;

  var req = new XMLHttpRequest;

  req.withCredentials = withCredentials;

  req.onreadystatechange = function () {
    if (req.readyState == 4)
      callback(req.status, req.responseText, req);
  };

  if (body) {
    headers["X-Requested-With"] = "XMLHttpRequest";
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  req.open(method, params.url, true);

  for (var field in headers) {
    req.setRequestHeader(field, headers[field]);
  }

  req.send(body);
};

/**
 * Shortcut to document.querySelector
 */
var $ = function (sel) {
  return document.querySelector(sel);
};

/**
 * Shortcut to document.querySelectorAll
 */
var $$ = function (sel) {
  return document.querySelectorAll(sel);
};

/**
 * Firefox app installation trigger
 */
if (navigator.mozApps && navigator.mozApps.install) {

  $("#firefoxos-install-button") && $("#firefoxos-install-button").addEventListener("click", function (e) {
      e.preventDefault();

      var manifest = location.origin + "/manifest.webapp",
          check = navigator.mozApps.checkInstalled(manifest);

      check.onsuccess = function (event) {
        if (!check.result) {
          var install = navigator.mozApps.install(manifest);
          install.onerror = function () {
            console.log('Installation Failed. Error: ' + this.error.name);
          };
        }
      };
    }, false);
}
