var schema = {
  name: {
    required: true,
  },
  dueDate {
    rules: [{
      required: true,
      validators.isDate(string),
      message: 'Must be a date',
    }],
  },
  isActive: {
    rules: [{
      required: true,
      validators.isBoolean(string),
      message:'Must be True or False',
     }]
  }
};

module.exports = require('./baseController')('School', schema);
