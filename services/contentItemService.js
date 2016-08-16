var ContentItem = require('../models/').ContentItem;
var contentItemService = require('./baseDbService')(ContentItem);

module.exports = contentItemService;
