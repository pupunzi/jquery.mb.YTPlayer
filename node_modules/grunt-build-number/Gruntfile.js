/*
 * grunt-build-number
 * https://github.com/creynders/grunt-build-number
 *
 * Copyright (c) 2014 Camille Reynders
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  // load all npm grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    }
  });

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint']);

};
