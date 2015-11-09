var paths = {};
paths.serverRoot = __dirname + '/..';

paths.sqlRoot = paths.serverRoot + '/sql/';
paths.sqlSrc = paths.sqlRoot + 'src/';
paths.sqlDistFile = paths.sqlRoot + 'dist/yadaguru.sql';

module.exports = paths;
