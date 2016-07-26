var schema = {
  phoneNumber: {
    required: true,
    rules: [{
      validator: 'isPhoneNumber',
      message: 'must be a string of 10 digits'
    }],
    sanitizers: ['sanitizeDigitString']
  },
  confirmCode: {
    rules: [{
      validator: 'isSixDigits',
      message: 'must be a string of 6 digits'
    }],
    sanitizers: ['sanitizeDigitString']
  },
  sponsorCode: {
    required: false
  }
};

module.exports = require('../lib/resourceControllerFactory')('User', schema);
