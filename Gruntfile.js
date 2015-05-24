module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),


		copy: {
			dist: {
				files: [
					{flatten: true, expand: false, src: ['../jquery.mb.browser/inc/jquery.mb.browser.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: false, src: ['../jquery.mb.storage/inc/jquery.mb.storage.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: false, src: ['../jquery.mb.CSSAnimate/inc/jquery.mb.CSSAnimate.min.js'], dest: 'src/dep/'},
					{flatten: true, expand: false, src: ['../jquery.mb.simpleSlider/inc/jquery.mb.simpleSlider.min.js'], dest: 'src/dep/'}
				]
			}
		},

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: [ 'src/*.js','../jquery.mb.browser/inc/jquery.mb.browser.min.js','../jquery.mb.storage/inc/jquery.mb.storage.min.js','../jquery.mb.CSSAnimate/inc/jquery.mb.CSSAnimate.min.js','../jquery.mb.simpleSlider/inc/jquery.mb.simpleSlider.min.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},

			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
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

		watch: {
			files: ['src/css/*.css','src/*.js', 'Gruntfile.js'],
			tasks: ['copy','concat', 'uglify', 'cssmin']
		}

	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['copy','concat', 'uglify', 'cssmin']);

};
