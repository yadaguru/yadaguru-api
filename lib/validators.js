var validators = require('validator');
var sanitizers = require('./sanitizers');
var ValidationError = require('./errors').ValidationError;

module.exports = function() {

  validators.isPhoneNumber = function(phoneNumber) {
    var phoneNumberRegex = /^\d{10}$/;
    return phoneNumberRegex.test(phoneNumber);
  };

  validators.isSixDigits = function(string) {
    return validators.isNumeric(string) && validators.isLength(string, {min: 6, max: 6});
  };

  var _validateField = function(field, value, rules) {
    if (!rules) {
      return [];
    }

    return rules.map(function(rule) {
      if (!validators[rule.validator](value, rule.options)) {
        return ({
          field: field,
          message: rule.message,
          value: value
        });
      }
    }).filter(function(el) {return el});
  };

  var validateRequest = function(requestBody, validationSchema, errors) {
    var fields = Object.keys(requestBody);

    errors = errors || [];

    errors = errors.concat(fields.map(function(field) {
      if (!validationSchema.hasOwnProperty(field)) {
        return [];
      }
      return _validateField(field, requestBody[field], validationSchema[field].rules);
    }).reduce(function(a, b) {return a.concat(b)}, []));

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? new ValidationError(errors) : null
    }
  };

  var validateAll = function(requestBody, validationSchema) {
    var schemaFields = Object.keys(validationSchema);
    var errors = schemaFields.map(function(field) {
      if (validationSchema[field].required && typeof requestBody[field] === 'undefined') {
        return {
          field: field,
          message: field + ' is required'
        }
      }
    }).filter(function(el) {return el});
    return validateRequest(requestBody, validationSchema, errors);

  };

  var sanitizeAndValidate = function(requestBody, validationSchema, all) {
    var sanitizedBody = sanitizers.sanitizeRequest(requestBody, validationSchema);
    var validationFn = all ? validateAll : validateRequest;
    validation = validationFn(sanitizedBody, validationSchema);
    if (validation.isValid) {
      validation.sanitizedData = sanitizedBody;
    }
    return validation;
  };

  return {
    validateRequest: validateRequest,
    validateAll: validateAll,
    sanitizeAndValidate: sanitizeAndValidate,
    validators: validators
  };

}();

