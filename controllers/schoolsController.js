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

var requiredRoles = {
  getAllForUser: ['user'],
  postForUser: ['user'],
  getByIdForUser: ['user'],
  putOnIdForUser: ['user'],
  removeByIdForUser: ['user']
};

module.exports = require('./baseController')('School', schoolService, schema, requiredRoles);
