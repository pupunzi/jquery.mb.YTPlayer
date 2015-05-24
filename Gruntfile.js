module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: [ 'inc/*.js','../jquery.mb.browser/inc/jquery.mb.browser.min.js','../jquery.mb.storage/inc/jquery.mb.storage.min.js','../jquery.mb.CSSAnimate/inc/jquery.mb.CSSAnimate.min.js','../jquery.mb.simpleSlider/inc/jquery.mb.simpleSlider.min.js'],
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

		watch: {
			files: ['inc/*.js', 'Gruntfile.js'],
			tasks: ['concat', 'uglify']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['concat', 'uglify']);

};
