module.exports = function(grunt) {
    //project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: { // Task
            dist: { // Target
                options: { // Target options
                    style: 'compressed'
                },
                files: { // Dictionary of files
                    'dist/css/style.min.css': 'src/css/style.scss', // 'destination': 'source'
                }
            }
        }, //end of sass
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'dist/js/app.min.js': ['src/js/app.js']
                }
            }
        }
    });

    //load task(s)
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //register task(s)
    grunt.registerTask('default', ['sass', 'uglify']);
};
