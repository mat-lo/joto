var fs = require('fs');
var path = require('path');
var test = require('tape');
var jsdom = require('jsdom');
var flatten = require('../../lib/flatten');

function svgFile(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'svg', name))
}

test('Should flatten an empty SVG', function(t) {
  flatten('<svg></svg>', function(err, flattened) {
    t.equal(err, null);
    t.equal(flattened, '<svg></svg>')
    t.end();
  })
})

test('Should flatten an empty SVG with empty options', function(t) {
  flatten('<svg></svg>', {}, function(err, flattened) {
    t.equal(err, null);
    t.equal(flattened, '<svg></svg>')
    t.end();
  })
})

test('Should reject a non SVG document', function(t) {
  flatten('<html></html>', function(err, flattened) {
    t.equal(err.name, 'SVGTagNotFound');
    t.end();
  })
})

test('Should replace shapes with paths', function(t) {
  flatten(svgFile('01-no-transform.svg'), function(err, flattened) {
    jsdom.env(flattened, function(err, window) {
      t.equal(window.document.getElementsByTagName('path').length, 4);
      t.equal(window.document.getElementsByTagName('circle').length, 0);
      t.equal(window.document.getElementsByTagName('rect').length, 0);
      t.end();
    })
  })
})

test('Should flatten shapes with options', function(t) {
  flatten(svgFile('01-no-transform.svg'),
    {
      toCubics: true,
      toAbsolute: true,
      rectsAsArgs: true,
      dec: 2
    },
    function(err, flattened) {
    jsdom.env(flattened, function(err, window) {
      t.equal(window.document.getElementsByTagName('path').length, 4);
      t.equal(window.document.getElementsByTagName('circle').length, 0);
      t.equal(window.document.getElementsByTagName('rect').length, 0);
      t.end();
    })
  })
})

test('Should remove transform attributes', function(t) {
  flatten(svgFile('07-nested.svg'), function(err, flattened) {
    jsdom.env(flattened, function(err, window) {
      var gs = window.document.getElementsByTagName('g');
      t.equal(gs.length, 3);
      for (var i = 0; i < gs.length; i++) {
        t.equal(gs[i].getAttribute('transform'), null)
      }

      var paths = window.document.getElementsByTagName('path');
      t.equal(paths.length, 4);
      for (var i = 0; i < paths.length; i++) {
        t.equal(paths[i].getAttribute('transform'), null)
      }
      t.end();
    })
  })
})

test('Should ignore invalid transforms', function(t) {
  flatten(svgFile('08-invalid.svg'), function(err, flattened) {
    jsdom.env(flattened, function(err, window) {
      t.equal(window.document.getElementsByTagName('path').length, 4);
      t.end();
    })
  })
})

test('Should replace polylines with paths', function(t) {
  flatten(svgFile('10-polyline.svg'), function(err, flattened) {
    jsdom.env(flattened, function(err, window) {
      t.equal(window.document.getElementsByTagName('path').length, 2);
      t.equal(window.document.getElementsByTagName('polygon').length, 0);
      t.equal(window.document.getElementsByTagName('polyline').length, 0);
      t.end();
    })
  })
})
