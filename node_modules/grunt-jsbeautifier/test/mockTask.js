'use strict';

var grunt = require("grunt"),
    _ = grunt.util._;

module.exports = function(taskOptions, files, done) {
    return {
        _taskOptions: taskOptions,
        files: [{
            src: grunt.file.expand(files)
        }],
        options: function(defs) {
            return _.defaults(this._taskOptions, defs);
        },
        async: function() {
            return done || function() {};
        }
    };
};
