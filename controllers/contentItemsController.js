var contentItemService = require('../services/contentItemService');

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
