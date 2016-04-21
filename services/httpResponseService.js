var validator = require('validator');

var httpResponseService = function() {

  var validateRequest = function(data, rules, ignoreRequired) {

    var fields = Object.keys(rules);
    var invalidFields = [];

    fields.forEach(function(field) {
      if (!ignoreRequired && rules[field].required && typeof data[field] === 'undefined') {
        invalidFields.push(field + ' is required');
      } else if (typeof rules[field].validate === 'function' && data[field] && !rules[field].validate(data[field], validator, data)) {
        if (typeof rules[field].message === 'string') {
          invalidFields.push(rules[field].message);
        } else {
          invalidFields.push(field + ' is not valid');
        }
      }
    });

    return invalidFields;

  };

  var assembleErrorResponse = function(errorCode, errors) {

    return {
      status: errorCode,
      errors: errors
    }

  };

  var assemble404Response = function(resource, id, plural) {

    var does = plural ? 'do' : 'does';

    return assembleErrorResponse(404, [resource + ' with id of ' + id + ' ' + does + ' not exist']);

  };

  return {
    validateRequest: validateRequest,
    assembleErrorResponse: assembleErrorResponse,
    assemble404Response: assemble404Response
  }

};

module.exports = httpResponseService;
