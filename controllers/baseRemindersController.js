var schema = {
  name: {
    required: true
  },
  message: {
    required: true
  },
  detail: {
    required: true
  },
  lateMessage: {
    required: false
  },
  lateDetail: {
    required: false
  },
  categoryId: {
    required: true,
    rules: [{
      validator: 'isNumeric',
      message: 'must be a number'
    }]
  },
  timeframeIds: {
    required: true,
    rules: [{
      validator: 'isArrayOfNumbers',
      message: 'must be an array of timeframe IDs'
    }]
  }
};

module.exports = require('./baseController')('BaseReminder', schema);
