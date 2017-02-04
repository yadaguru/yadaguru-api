module.exports = function() {

  var sanitizers = {
    sanitizeDigitString: function(digitString) {
      return digitString.replace(/\D+/g, '');
    }
  };

  var sanitizeRequest = function(requestBody, validationSchema) {
    return Object.keys(validationSchema).map(function(field) {
      if (typeof requestBody[field] !== 'undefined') {
        if (validationSchema[field].sanitizers) {
          return validationSchema[field].sanitizers.reduce(function(value, sanitizer) {
            var sanitizedValue = sanitizers[sanitizer](value);
            return {
              field: field,
              value: sanitizedValue
            }
          }, requestBody[field]);
        }
        return {
          field: field,
          value: requestBody[field]
        };
      }
    }).reduce(function(sanitizedRequestBody, fieldValue) {
      if (fieldValue) {
        sanitizedRequestBody[fieldValue.field] = fieldValue.value;
      }
      return sanitizedRequestBody;
    }, {});
  };

  return {
    sanitizeRequest: sanitizeRequest,
    sanitizers: sanitizers
  }

}();
