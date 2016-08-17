var schoolService = require('../services/schoolService');

var schema = {
  name: {
    required: true
  },
  dueDate: {
    required: true,
    rules: [{
      validator: 'isDate',
      message: 'must be a date'
    }]
  },
  isActive: {
    rules: [{
      validator: 'isBoolean',
      message:'must be true or false'
     }]
  }
};

module.exports = require('./baseController')('School', schoolService, schema);
