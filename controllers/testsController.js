var schema = {
  type: {
    required: true
  },
  message: {
    required: true
  },
  detail: {
    required: true
  }
};

module.exports = require('./baseController')('Test', schema);
