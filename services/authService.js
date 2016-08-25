var jwt = require('jsonwebtoken');
var secret = process.env.SECRET || 'development_secret';

module.exports = function() {

  function getUserToken(userId, role) {
    if (typeof userId === 'undefined') {
      throw Error('userId must be provided');
    }

    var payload = {
      userId: userId,
      role: role || 'user'
    };

    return jwt.sign(payload, secret);
  }

  function verifyUserToken(token) {
    if (typeof token === 'undefined') {
      throw Error('token must be provided');
    }

    return jwt.verify(token, secret);
  }

  return {
    getUserToken: getUserToken,
    verifyUserToken: verifyUserToken
  };

}();
