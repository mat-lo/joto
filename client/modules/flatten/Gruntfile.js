var async = require('async');
var flatten = require('./lib/flatten');

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('./package.json'),
    browserify: {
      build: {
        src: 'lib/jsdom/flatten.js',
        dest: 'lib/jsdom/dist/flatten.js'
      }
    },
    mustache_render: {
      build: {
        files: [
          {
            data: __dirname + '/test/template/data.js',
            template: __dirname + '/test/template/index.html',
            dest: __dirname + '/test/output/index.html'
          }
        ]
      }
    },
    flatten: {
      build: {
        expand: true,
        src: '*',
        dest: 'test/output/svg',
        cwd: 'test/svg'
      }
    }
  });

  grunt.loadNpmTasks('grunt-mustache-render');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['browserify']);
  grunt.registerTask('test', ['flatten', 'mustache_render']);

  grunt.registerMultiTask('flatten', function() {
    var done = this.async();

    async.eachSeries(this.files, function(file, cb) {
      async.eachSeries(file.src, function(filepath, cb) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          cb();
        }

        var contents = grunt.file.read(filepath);
        flatten(contents, function(err, flattened) {
          if (err) {
            cb(err)
            return;
          }
          grunt.file.write(file.dest, flattened)
          cb();
        })
      }, cb)
    }, done)
  })

};
