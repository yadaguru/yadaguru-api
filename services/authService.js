var jwt = require('jsonwebtoken');
var secret = process.env.SECRET || 'development_secret';
var env = process.env.NODE_ENV || 'development';

module.exports = function() {

  var tokenOptions = {
    test: {
      noTimestamp: true
    },
    development: {},
    production: {}
  };

  function getUserToken(userId, role) {
    if (typeof userId === 'undefined') {
      throw Error('userId must be provided');
    }

    var payload = {
      userId: userId,
      role: role || 'user'
    };

    return jwt.sign(payload, secret, tokenOptions[env]);
  }

  function verifyUserToken(token) {
    if (typeof token === 'undefined') {
      throw Error('token must be provided');
    }

    return jwt.verify(token, secret);
  }

  function generateConfirmCode() {
    return String(Math.floor(Math.random() * (999999 - 100000) + 100000));
  }

  function getUserData(token) {
    var tokenData;

    try {
      tokenData = verifyUserToken(token);
    } catch (e) {
      return false;
    }

    return tokenData;
  }


  return {
    getUserToken: getUserToken,
    verifyUserToken: verifyUserToken,
    generateConfirmCode: generateConfirmCode,
    getUserData: getUserData
  };

}();
