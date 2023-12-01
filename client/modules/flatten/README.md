# svg-flatten #

This module is an adaptation of [this](https://gist.github.com/timo22345/9413158) code to run in NodeJS. This module replaces shape tags (circle, rect, ellipse, polyline, polygon) with paths in SVG files and optimizes transformations (translations, rotations, scaling, skewing, matrices) by applying them directly on path coordinates.

### Usage ###
```
#!javascript

var flatten = require('svg-flatten')
flatten('<svg><circle ...></svg>', function(err, flattened) {
  if (err) {
    console.log('Error flattening SVG:', err.stack);
    return;
  }
  console.log(flattened); // <svg><path ...></svg>
});
```

### Options ###

`flatten` method also accepts options supported by the original script, through an optional parameter `options`:
```
#!javascript

flatten('<svg><circle ...></svg>', 
    {
      toCubics: false,
      toAbsolute: false,
      rectAsArgs: false,
      dec: 2
    },
    function(err, flattened) { ... });
});
```

### Development ###

If you intend to make changes in this code, first make sure you have the following tools installed globally:

```
#!bash

npm install -g grunt-cli bower tape
```

Then clone this project:

```
#!bash

git clone git@bitbucket.org:jimjiminyjimjim/flattenjs-node.git
```

To install development dependencies, run (starting at project root):

```
#!bash

npm install
cd lib/jsdom
bower install
cd ../../test
bower install
```

The core logic of this module (adaptation of original source) is the file `lib/jsdom/flatten.js`. After changing this file, you should compile it by running (at project root):

```
#!bash

grunt
```

This creates/updates the file `lib/jsdom/dist/flatten.js` which is actually used by this module. Note that since it is an auto-generated file, you should not edit it directly.

### Tests ###

After cloning this project and setting up its dependencies (see above) run unit tests by typing (at project root dir):

```
#!bash
tape test/unit/flatten_spec.js

```

You can also generate a web page containing sample SVG flatten results for comparison purposes. Type (at project root dir):

```
#!bash
grunt test

```

Then open `file://{PROJECT_ROOT}/test/output/index.html` in your browser.

If you want to test flattening any other SVG file, all you have to do is to put the SVG file you want to flatten into dir `test/svg` and run `grunt test` again at project root dir. The HTML file should be updated to show the result of flattening that SVG file.