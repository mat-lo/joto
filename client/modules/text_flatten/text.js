var opentype = require('opentype.js');
var computeLayout = require('opentype-layout');
var parseSvg = require('parse-svg-path');
var drawSvg = require('draw-svg-path');
var toSvg = require('./glyphToSvgPath');
var extract = require('extract-svg-path')

var fs = require('fs');


var parseUnit = require('parse-unit');
var convert = require('./convert');


var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(500, 500, 'svg')
  , ctx = canvas.getContext('2d');




function svg (ctx, options, font, callback) {
  
  canvas = '';
  canvas = new Canvas(500, 500, 'svg');
  ctx = canvas.getContext('2d');

  var text = options.text;
  var styles = options.attr;

  const fontSizePx = convert.getFontSizePx(font, styles.fontSize);


  // Layout some text - notice everything is in em units!
  var result = computeLayout(font, text, {
    letterSpacing: convert.getEmUnits(font, fontSizePx, styles.letterSpacing),
    lineHeight: convert.getEmUnits(font, fontSizePx, styles.lineHeight),
    width: convert.getEmUnits(font, fontSizePx, parseFloat(styles.width)),
    align: styles.textAlign
  });

  // Our <div> is offset 20px by left/top, let's match that.
  // We are still in pixel space so no need to scale to font EM units!
  ctx.translate(getPx(styles.left), getPx(styles.top));
  // Now scale and flip coordinates: our EM box has (0, 0) as lower left
  const pxScale = convert.getScale(font, fontSizePx);
  ctx.scale(pxScale, -pxScale);
  // We need to scale the line to adjust to the new font size
  //could be linked to pxscale
  ctx.lineWidth = 1;

  //Metrics();
  drawText();

  callback(canvas.toBuffer().toString());

  function Metrics () {
    const bx = result.left;
    const bh = result.height;
    const measuredWidth = result.maxLineWidth;

    // From top of box to the baseline of the first line
    var lY1 = -(result.leading / 2 + font.ascender);
    // From bottom of box to the baseline of last line
    var lY2 = -bh + result.baseline;
  }


  function drawText () {
    result.glyphs.forEach(glyph => {
      var data = glyph.data;
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'red';
      ctx.save();
      ctx.translate(glyph.position[0], glyph.position[1]);
      ctx.beginPath();
      drawSvg(ctx, parseSvg(toSvg(data.path)));
      ctx.stroke();
      ctx.restore();
    });
  }

};


function getPx (value) {
  value = typeof value === 'string' ? parseUnit(value) : [ value, 'px' ];
  if (value[1] !== 'px') throw new TypeError('Expected px unit!');
  return value[0];
}


function text2svg(options, callback){
  ctx = canvas.getContext('2d');
  opentype.load(__base + options.font, function (err, font) {
    if (err) throw err;
    svg(ctx, options, font, function(result){
          callback(result);
    });
  });
}


module.exports = text2svg;