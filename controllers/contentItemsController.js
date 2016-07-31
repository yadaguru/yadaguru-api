var schema = {
  name: {
    required: true
  },
  content: {
    required: true
  }
};

module.exports = require('./baseController')('ContentItem', schema);
