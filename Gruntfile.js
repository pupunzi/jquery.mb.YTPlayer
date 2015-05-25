module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		copy: {
			dist: {
				files: [
					{flatten: true, expand: true, cwd: '../jquery.mb.browser/inc/', src: ['jquery.mb.browser.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: true, cwd: '../jquery.mb.storage/inc/', src: ['jquery.mb.storage.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: true, cwd: '../jquery.mb.CSSAnimate/inc/', src: ['jquery.mb.CSSAnimate.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: true, cwd: '../jquery.mb.simpleSlider/inc/', src: ['jquery.mb.simpleSlider.min.js'], dest: 'src/dep/'},
					{flatten: false, expand: true, cwd: 'src/css/font/', src: ['**'],  dest: 'dist/css/font/'},
					{flatten: false, expand: true, cwd: 'src/css/images/', src: ['**'],  dest: 'dist/css/images/'},
					{flatten: true, expand: true, cwd: 'src/', src: ['index.tmpl'], dest: 'dist/',
						rename: function(dest, src) {
							return dest + src.replace('.tmpl','.html');
						}}
				]
			}
		},

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: [ 'src/*.js','src/dep/*.js'],
				dest: 'dist/<%= pkg.title %>.js'
			}
		},

		uglify: {
			options: {
				banner: '/*' +
						'<%= pkg.title %> <%= grunt.template.today("dd-mm-yyyy") %>\n' +
						' _ jquery.mb.components                                                                                                                             _\n' +
						' _ email: matteo@open-lab.com                                                                                                                       _\n' +
						' _ Copyright (c) 2001-<%= grunt.template.today("yyyy") %>. Matteo Bicocchi (Pupunzi);                                                                                              _\n' +
						' _ blog: http://pupunzi.open-lab.com                                                                                                                _\n' +
						' _ Open Lab s.r.l., Florence - Italy                                                                                                                _\n' +
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
				roundingPrecision: -1
			},
			dist: {
				files: {
					'dist/css/<%= pkg.name %>.min.css': ['src/css/*.css']
				}
			}
		},

		includereplace: {
			dist: {
				options: {
					prefix: '{{ ',
					suffix: ' }}',
					globals: {
						version: '<%= pkg.version %>'
					}
				},
				files: [
					{src: 'dist/*.js', expand: true},
					{src: 'dist/*.html', expand: true},
					{src: 'dist/css/*.css', expand: true}
				]
			}
		},

		watch: {
			files: ['src/css/*.css','src/*.js','src/*.html', 'Gruntfile.js'],
			tasks: ['copy','concat', 'uglify', 'cssmin', 'includereplace']
		}

	});

	grunt.loadNpmTasks('grunt-include-replace');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['copy','concat', 'uglify', 'cssmin', 'includereplace']);

};
