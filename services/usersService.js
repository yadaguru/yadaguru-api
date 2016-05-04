var usersService = function(database) {

  var create = function(phoneNumber, callback) {
    phoneNumber = sanitizePhoneNumber(phoneNumber);
    if (isPhoneNumber(phoneNumber)) {
      database.membership.register([phoneNumber], function(err, data) {
        data = data[0];
        if (err) {
          callback({ status: 500, message: 'Internal server error occurred' }, null);
        } else if (data.success) {
          callback(null, { userId: data.new_id});
        } else {
          callback({ status: 409, message: data.message }, null);
        }
      });
    } else {
      callback({ status: 400, message: 'Invalid Phone Number: Must be 10 digits' }, null);
    }
  };

  var sanitizePhoneNumber = function(phoneNumber) {
    return phoneNumber.replace(/\D+/g, "");
  };

  var isPhoneNumber = function(phoneNumber) {
    var phoneNumberRegex = /^\d{10}$/;
    return phoneNumberRegex.test(phoneNumber);
  };

  return {
    create : create
  };
};

module.exports = usersService;
