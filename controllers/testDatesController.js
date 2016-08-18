var testDateService = require('../services/testDateService');

var schema = {
  testId: {
    required: true,
    rules: [{
      validator: 'isNumeric',
      message: 'must be a number'
    }]
  },
  registrationDate: {
    required: true,
    rules: [{
      validator: 'isDate',
      message: 'must be a date'
    }]

  },
  adminDate: {
    required: true,
    rules: [{
      validator: 'isDate',
      message: 'must be a date'
    }]
  }
};

module.exports = require('./baseController')('TestDate', testDateService, schema);
