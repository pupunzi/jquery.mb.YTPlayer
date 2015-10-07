/*
 * grunt-build-number
 * https://github.com/creynders/grunt-build-number
 *
 * Copyright (c) 2014 Camille Reynders
 * Licensed under the MIT license.
 */

'use strict';

var util = require( 'util' );

var findup = require( 'findup-sync' );

module.exports = function( grunt ){

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask( 'buildnumber', 'Grunt plugin for maintaining a build number in package.json', function(){

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options( {
      field : 'build'
    } );

    var files = this.files;
    if( !files.length ){
      files = [
        {
          src : ["package.json"]
        }
      ];
    }

    files.forEach( function( file ){
      file.src.forEach( function( filename ){
        var filepath = findup( filename );
        if( filepath && grunt.file.exists( filepath ) ){
          var meta = grunt.file.readJSON( filepath );
          var buildNum = meta[options.field];
          if( typeof buildNum !== "undefined" ){
            buildNum = parseInt( buildNum, 10 ) + 1;
          }else{
            //create build field
            buildNum = 1;
          }
          meta[options.field] = buildNum.toString();
          grunt.file.write( filepath, JSON.stringify( meta, null, 2 ) );
          grunt.log.oklns( 'Build number set to "' + buildNum + '" in "' + filename + '".' );
        }else{
          grunt.fail.fatal( "file(s) not found: " + file.orig.src );
        }
      } );
    } );
  } );

};
