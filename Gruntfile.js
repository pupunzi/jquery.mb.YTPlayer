/*::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 jquery.mb.components
 
 file: Gruntfile.js
 last modified: 10/25/18 8:00 PM
 Version:  {{ version }}
 Build:  {{ buildnum }}
 
 Open Lab s.r.l., Florence - Italy
 email:  matteo@open-lab.com
 blog: 	http://pupunzi.open-lab.com
 site: 	http://pupunzi.com
 	http://open-lab.com
 
 Licences: MIT, GPL
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
 
 Copyright (c) 2001-2018. Matteo Bicocchi (Pupunzi)
 :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/

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
		replace: {
			dist: {
				options: {
					patterns: [
						{
							match: /browser/g,
							replacement: function () {
								return 'mbBrowser'; // replaces "foo" to "bar"
							}
						}
					]
				},
				files: [
					{expand: true, flatten: true, src: ['dist/jquery.mb.YTPlayer.js'], dest: 'dist/'}
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
						' _ email: matbicoc@gmail.com \n' +
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
				shorthandCompacting: true,
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

		strip_code: {
			options: {
				blocks: [
					{
						start_block: "/* src-block */",
						end_block: "/* end-src-block */"
					},
					{
						start_block: "<!-- start-html-src-code -->",
						end_block: "<!-- end-html-src-code -->"
					}
				]
			},
			your_target: {
				src: 'dist/*.js'
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
					maxPreserveNewlines: 2,
					"comma_first"         : true,
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
			scripts: {
				files: 'src/**',
				tasks: ['default'],
				options: {
					debounceDelay: 250,
				},
			},
		}

	});

	grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	//grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks('grunt-strip-code');
	grunt.loadNpmTasks('grunt-replace');

	grunt.loadNpmTasks('grunt-build-number');
	grunt.loadNpmTasks('grunt-bump');

	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['buildnumber', 'copy', 'concat', 'strip_code', 'uglify', 'replace', 'cssmin', 'includereplace']); //'jsbeautifier', 'replace'
};
