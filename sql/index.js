var path             = require('path'),
    fs               = require('fs'),
    _                = require('underscore')._,
    src              = path.join(__dirname, 'src');

exports.getSql = function () {
  var sql = [];
  var schemas = fs.readdirSync(src);
  _.each(schemas, function(schema) {
    var schemaPath = path.join(src, schema);
    if (fs.lstatSync(schemaPath).isDirectory()) {
      var build = [];
      build.push(getStart());
      build.push(getInit(schemaPath));
      build.push(getTables(schemaPath));
      build.push(getFunctions(schemaPath));
      build.push(getEnd());
      sql.push(build.join('\r\n\r\n'));
    }
  });
  return sql.join('\r\n\r\n');
};

var getStart = function () {
  var start = [];

  // Set date comment for file
  start.push('--built on ' + new Date());

  // start transaction
  start.push('BEGIN;');

  return start.join('\r\n\r\n');
};

var getInit = function(dir) {
  // Get init file
  var initFile = path.join(dir, 'init.sql');
  return fs.readFileSync(initFile, {encoding : 'utf-8'});
};

var getTables = function(dir) {
  var sqlFiles = [];
  // Read directory
  var tableDir = path.join(dir, 'tables/');
  var files = fs.readdirSync(tableDir);
  // For each file, if .sql, read file and push
  _.each(files, function(file) {
    // if .sql
    if (path.extname(file) === '.sql') {
      // read file and push
      var sql = fs.readFileSync(tableDir + file, {encoding: 'utf-8'});
      sqlFiles.push(sql);
    }
  });
  sqlFiles.push('select \'tables installed\' as result;');

  // add foregin keys
  var indexDir = path.join(dir, 'indexes/');
  var foreignKeys = fs.readFileSync(indexDir + 'foreign_keys.sql', {encoding: 'utf-8'});
  sqlFiles.push(foreignKeys);

  return sqlFiles.join('\r\n\r\n');
};

var getFunctions = function(dir) {
  var sqlFiles = [];
  // Read directory
  var functionDir = path.join(dir, 'functions/');
  try {
    var files = fs.readdirSync(functionDir);
  } catch (e) {
    return;
  }
  // For each file
  _.each(files, function(file) {
    // if .sql
    if (path.extname(file) === '.sql') {
      // read file and push
      var sql = fs.readFileSync(functionDir + file, {encoding: 'utf-8'});
      sqlFiles.push(sql);
    }
  });
  sqlFiles.push('select \'functions installed\' as result;');

  return sqlFiles.join('\r\n\r\n');
};

var getEnd = function() {
  return 'COMMIT;';
};
