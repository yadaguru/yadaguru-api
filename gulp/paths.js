var clientRoot = 'client/',
    serverRoot = '',
    publicCssRoot = clientRoot + 'public/css/',
    bowerPath  = clientRoot + 'vendor/';

module.exports = {
  clientRoot: clientRoot,
  serverRoot: serverRoot,
  publicCssRoot: publicCssRoot,
  allClient: [
    clientRoot + '**/*.js',
    clientRoot + '**/*.css',
    clientRoot + '**/*.html',
    !bowerPath
  ]
};
