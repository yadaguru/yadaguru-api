var port = process.env.PORT || 8080,
    path = require('path');

module.exports = function() {
  var rootPath = path.join(__dirname, '..', '..');
  var clientPath = path.join(rootPath, 'client');
  return {
    port: port,
    rootPath: rootPath,
    clientPath: clientPath
  };
};
