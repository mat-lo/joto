var flatten = require('svg-flatten')
flatten('<svg></svg>', function(err, flattened) {
  if (err) {
    console.log('Error flattening SVG:', err.stack);
    return;
  }
  console.log(flattened); // <svg><path ...></svg>
});