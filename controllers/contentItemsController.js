var contentItemService = require('../services/contentItemService');

var schema = {
  name: {
    required: true
  },
  content: {
    required: true
  }
};

module.exports = require('./baseController')('ContentItem', contentItemService, schema);
