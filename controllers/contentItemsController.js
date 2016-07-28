var schema = {
  Name: {
    required: true
  }
  content: {
    required: true
  }
};

module.exports = require('./baseController')('ContentItem', schema);
