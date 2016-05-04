var usersService = function(database) {

  var create = function(phoneNumber, callback) {
    callback(null, { userId: 9 });
  };

  return {
    create : create
  };
};

module.exports = usersService;
