module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		copy: {
			dist: {
				files: [
					{flatten: true, expand: true, cwd: '../jquery.mb.browser/inc/', src: ['jquery.mb.browser.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: true, cwd: '../jquery.mb.storage/inc/', src: ['jquery.mb.storage.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: true, cwd: '../jquery.mb.CSSAnimate/inc/', src: ['jquery.mb.CSSAnimate.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: true, cwd: '../jquery.mb.simpleSlider/inc/', src: ['jquery.mb.simpleSlider.min.js'], dest: 'src/dep/'},
					{flatten: false, expand: true, cwd: 'src/css/font/', src: ['**'], dest: 'dist/css/font/'},
					{flatten: false, expand: true, cwd: 'src/css/images/', src: ['**'], dest: 'dist/css/images/'},
					{flatten: true, expand: true, cwd: 'src/', src: ['index.tmpl'], dest: 'dist/',
						rename: function (dest, src) {
							return dest + src.replace('.tmpl', '.html');
						}
					}
				]
			}
		},

		concat: {
			options: {
				separator: ';'
			},
			dist   : {
				src : [ 'src/*.js', 'src/dep/*.js'],
				dest: 'dist/<%= pkg.title %>.js'
			}
		},

		uglify: {
			options: {
				banner: '/*' +
						'<%= pkg.title %> <%= grunt.template.today("dd-mm-yyyy") %>\n' +
						' _ jquery.mb.components \n' +
						' _ email: matteo@open-lab.com \n' +
						' _ Copyright (c) 2001-<%= grunt.template.today("yyyy") %>. Matteo Bicocchi (Pupunzi); \n' +
						' _ blog: http://pupunzi.open-lab.com \n' +
						' _ Open Lab s.r.l., Florence - Italy \n' +
						' */\n'
			},

			dist: {
				files: {
					'dist/<%= pkg.title %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision  : -1
			},
			dist   : {
				files: {
					'dist/css/<%= pkg.name %>.min.css': ['src/css/*.css']
				}
			}
		},

		includereplace: {
			dist: {
				options: {
					prefix : '{{ ',
					suffix : ' }}',
					globals: {
						version: '<%= pkg.version %>',
						buildnum: '<%= grunt.file.readJSON("package.json").buildnum %>'
					}
				},
				files  : [
					{src: 'dist/*.js', expand: true},
					{src: 'dist/*.html', expand: true},
					{src: 'dist/css/*.css', expand: true}
				]
			}
		},

		jsbeautifier: {
			files  : ['src/*.js', '!dist/*.min.js', 'src/*.html', 'src/*.tmpl', 'src/css/*.css'],
			options: {
				html: {
					braceStyle         : "collapse",
					indentChar         : "\t",
					indentScripts      : "keep",
					indentSize         : 1,
					maxPreserveNewlines: 3,
					preserveNewlines   : true,
					spaceInParen       : true,
					unformatted        : ["a", "sub", "sup", "b", "i", "u"],
					wrapLineLength     : 0
				},
				css : {
					indentChar         : " ",
					maxPreserveNewlines: 1,
					preserveNewlines   : false,
					indentSize         : 4
				},
				js  : {
					braceStyle             : "collapse",
					breakChainedMethods    : false,
					e4x                    : false,
					evalCode               : false,
					indentChar             : "\t",
					indentLevel            : 0,
					indentSize             : 1,
					indentWithTabs         : false,
					jslintHappy            : false,
					keepArrayIndentation   : true,
					keepFunctionIndentation: true,
					maxPreserveNewlines    : 3,
					preserveNewlines       : true,
					spaceBeforeConditional : false,
					spaceInParen           : true,
					unescapeStrings        : false,
					wrapLineLength         : 0,
					endWithNewline         : true
				}
			}
		},

		buildnumber: {
			options: {
				field: 'buildnum'
			},
			files  : ['package.json', 'bower.json']
		},

		bump: {
			options: {
				files             : ['package.json', 'bower.json'],
				updateConfigs     : [],
				commit            : true,
				commitMessage     : 'Release v%VERSION% stable',
				commitFiles       : ['-a'],
				createTag         : true,
				tagName           : '%VERSION%',
				tagMessage        : 'Version %VERSION%',
				push              : true,
				pushTo            : 'https://github.com/pupunzi/jquery.mb.YTPlayer.git',
				gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
				globalReplace     : true,
				prereleaseName    : 'alpha',
				regExp            : false
			}
		},

		watch: {
			files: ['src/css/*.css', 'src/*.js', 'src/*.html', 'Gruntfile.js'],
			tasks: ['default']
		}

	});

	grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks("grunt-jsbeautifier");

	grunt.loadNpmTasks('grunt-build-number');
	grunt.loadNpmTasks('grunt-bump');

	grunt.registerTask('default', ['buildnumber', 'jsbeautifier', 'copy', 'concat', 'uglify', 'cssmin', 'includereplace']);

};
