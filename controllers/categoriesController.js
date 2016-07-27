var schema = {
  name: {
    required: true
  }
};

module.exports = require('./baseController')('Category', schema);
