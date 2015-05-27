module.exports = function(grunt){

	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			vendor: {
				src: [],
				dest: 'build/vendor.js',
				options: {
					require: ['victor', 'async', 'events']
				}
			},
			client: {
				src: ['src/js/**/*.js'],
				dest: 'build/app.js',
				options: {
					external: ['victor', 'async']
				}
			}
		},

		concat: {
			client_css: {
				src: ['src/css/**/*.css'],
				dest: 'build/app.css'
			}
		},

		watch: {
			client_js: {
				files: ['src/js/**/*.js'],
				tasks: ['browserify:client']
			},
			client_css: {
				files: ['src/css/**/*.css'],
				tasks: ['concat:client_css']
			},
			html: {
				files: 'src/html/index.html',
				tasks: ['processhtml:build']
			}
		},

		uglify: {
			dist: {
				files: {
					'dist/app.bundle.js': ['build/vendor.js', 'build/app.js']
				}
			}
		},

		cssmin: {
			dist: {
				files: {
					'dist/app.min.css': ['build/app.css']
				}
			}
		},

		processhtml: {
			build: {
				files: {
					'build/index.html': ['src/html/index.html']
				}
			},
			dist: {
				files: {
					'dist/index.html': ['src/html/index.html']
				}
			}
		}
	})

	// Load the 'uglify' plugin
	grunt.loadNpmTasks('grunt-contrib-uglify')
	grunt.loadNpmTasks('grunt-browserify')
	grunt.loadNpmTasks('grunt-processhtml')
	grunt.loadNpmTasks('grunt-contrib-watch')
	grunt.loadNpmTasks('grunt-contrib-concat')
	grunt.loadNpmTasks('grunt-contrib-cssmin')

	grunt.registerTask('build', [
		'browserify',
		'concat:client_css',
		'processhtml:build'
	])

	grunt.registerTask('dist', [
		'build',
		'uglify',
		'cssmin:dist',
		'processhtml:dist'
	])

	// Register the 'default' task
	grunt.registerTask('default', ['build'])
}