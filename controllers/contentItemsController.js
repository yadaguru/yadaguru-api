var env = process.env.NODE_ENV || 'development';
var config = require('../config/config.json')[env];
var contentItemService = require('yadaguru-data')(config).contentItemService;

var schema = {
  name: {
    required: true
  },
  content: {
    required: true
  }
};

var requiredRoles = {
  getAll: ['admin'],
  post: ['admin'],
  putOnId: ['admin'],
  removeById: ['admin']
};

module.exports = require('./baseController')('ContentItem', contentItemService, schema, requiredRoles);
