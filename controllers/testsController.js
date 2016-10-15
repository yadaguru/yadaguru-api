var testService = require('../services/testService');

var schema = {
  type: {
    required: true
  },
  registrationMessage: {
    required: true
  },
  registrationDetail: {
    required: true
  },
  adminMessage: {
    required: true
  },
  adminDetail: {
    required: true
  }
};

var requiredRoles = {
  getAll: ['admin'],
  post: ['admin'],
  getById: ['admin'],
  putOnId: ['admin'],
  removeById: ['admin']
};

module.exports = require('./baseController')('Test', testService, schema, requiredRoles);
