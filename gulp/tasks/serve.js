var gulp        = require('gulp'),
    paths       = require('../paths'),
    nodemon     = require('gulp-nodemon'),
    util        = require('gulp-util'),
    port        = process.env.PORT || 8080;

gulp.task('serve', function() {

  var isDev = true; // TODO: Make into arg

  var nodeOptions = {
    script: paths.serverRoot + 'server.js',
    delayTime: 1, // 1 second delay
    env: {
      'PORT': port,
      'NODE_ENV': isDev ? 'dev' : 'prod'
    },
    watch: [paths.serverRoot + '**/*.*']
  };

  nodemon(nodeOptions)
    .on('restart', function(event) {
      log('*** nodemon restarted ***');
      log('Files changed on restart:\n' + event);
    })
    .on('start', function() {
      log('*** nodemon started ***');
    })
    .on('crash', function() {
      log('*** nodemon crashed ***');
    })
    .on('exit', function() {
      log('*** nodemon exited cleanly ***');
    });
});

function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        util.log(util.colors.blue(msg[item]));
      }
    }
  } else {
    util.log(util.colors.blue(msg));
  }
}
