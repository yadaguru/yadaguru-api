var gulp             = require('gulp'),
    massive          = require('massive'),
    fs               = require('fs'),
    paths            = require('../paths'),
    distFile         = paths.sqlDistFile,
    sql              = require('../../sql'),
    connectionString = 'postgres://yadaguru:yadaguru@localhost:15432/yadaguru'; // TODO: Move to settings file

// TODO: Promisify functions to avoid need for sync calls
// TODO: Create yadaguru user
// TODO: Set ownership of database & internals to yadaguru to avoid superuser account
gulp.task('build-sql', function() {
  fs.writeFileSync(distFile, sql.getSql());
});

gulp.task('install-sql', ['build-sql'], function() {
  massive.connect({ connectionString : connectionString }, function(err, db) {
    if(!db || !db.run) {
      console.log('Unable to connect to database ' + connectionString + '.');
      console.log('Check that it exists and/or adjust connection settings');
      return;
    }
    db.run(fs.readFileSync(distFile, {encoding : 'utf-8'}));
  });
});
