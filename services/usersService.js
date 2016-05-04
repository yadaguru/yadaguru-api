var usersService = function(database) {

  var create = function(phoneNumber, callback) {
    phoneNumber = phoneNumber.replace(/\D+/g, "");
    var phoneNumberRegex = /^\d{10}$/;

    if (phoneNumberRegex.test(phoneNumber)) {
      callback(null, { userId: 9 });
    } else {
      var error = {
        status: 400,
        message: 'Invalid Phone Number'
      }
      callback(error, null);
    }
  };

  return {
    create : create
  };
};

module.exports = usersService;
