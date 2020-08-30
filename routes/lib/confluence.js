/* heavily inspired by https://bitbucket.org/mrdon/taskmaster-plugin/src/5f6099c902ab8a17e41fdad9366d8cf66459ede4/app/jira/issues.js */

var _ = require("underscore");
var Q = require("q");

function Pages(http) {
  this.http = http;
}

var proto = Pages.prototype;

proto.getContent = function (pageId) {
  return invoke(this.http, "get", {
    uri: "/rest/prototype/1/content/" + pageId + ".json"
  });
};

function invoke(http, method, options) {
  options.json = true;
  var dfd = Q.defer();
  http[method](options, function (err, response) {
    var code = response && response.statusCode;
    if (err) {
      dfd.reject(err);
    }
    else if (code < 200 || code >= 300) {
      var msg = "Unexpected response: " + response.statusCode;
      var ex = new Error(msg);
      ex.detail = response.body;
      dfd.reject(ex);
    }
    else {
      dfd.resolve(response.body, response);
    }
  });
  return dfd.promise;
}

module.exports = function (http) {
  return new Pages(http);
};