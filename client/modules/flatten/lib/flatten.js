var path = require('path');
var jsdom = require("jsdom");
var error = require('debug')('flatten-svg:error');
var log = require('debug')('flatten-svg:log')

var JSDOM_SCRIPTS = [
  path.join(__dirname, 'jsdom/dist/flatten.js'),
  path.join(__dirname, 'jsdom/bower_components/gl-matrix/dist/gl-matrix.js') ];

var virtualConsole = jsdom.createVirtualConsole();

virtualConsole.on("log", function () {
  var args = Array.prototype.join.call(arguments, ' ');
  log.call(log, args)
});

module.exports = function(sourceSVG, options, cb) {
  if (typeof options == 'function') {
    cb = options;
    options = {}
  }

  jsdom.env({
    html: sourceSVG,
    scripts: JSDOM_SCRIPTS,
    virtualConsole: virtualConsole,
    done: function (err, window) {
      if (err) {
        error('Error setting up flatten context:', err.stack || err)
        cb(err);
        return;
      }
      var svg = window.document.getElementsByTagName('svg')[0];
      if (svg) {
        try {
          window.flatten(svg,
              options.toCubics,
              options.toAbsolute,
              options.rectAsArgs,
              options.dec);
          cb(null, window.document.getElementsByTagName('svg')[0].outerHTML)

        } catch (err) {
          error('Error flattening SVG', err.stack || err)
          cb(err)
          return;
        }
      } else {
        error('No SVG tag found')
        var e = new Error('SVG tag not found');
        e.name = 'SVGTagNotFound'
        cb(e)
      }
    }
  });
}
