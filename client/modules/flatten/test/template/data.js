var fs = require('fs')
var flatten = require('../../lib/flatten')
var path = require('path');

var srcSVGPath = path.join(__dirname, '..', 'svg');
var destSVGPath = path.join(__dirname, '..', 'output', 'svg');
var data = {
  tests: []
};

var svgs = fs.readdirSync(srcSVGPath);
for (var i = 0; i < svgs.length; i++) {
  var filename = svgs[i];
  data.tests.push({
    index: i,
    filename: filename,
    src: fs.readFileSync(path.join(srcSVGPath, filename)),
    dest: fs.readFileSync(path.join(destSVGPath, filename))
  })
}

module.exports = data;
