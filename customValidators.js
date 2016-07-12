var isPhoneNumber = function(phoneNumber) {
  var phoneNumberRegex = /^\d{10}$/;
  return phoneNumberRegex.test(phoneNumber);
};

module.exports = {
  isPhoneNumber: isPhoneNumber
};
