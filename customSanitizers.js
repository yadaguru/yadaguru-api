var sanitizePhoneNumber = function(phoneNumber) {
  return phoneNumber.replace(/\D+/g, '');
};

module.exports = {
  sanitizePhoneNumber: sanitizePhoneNumber
};
