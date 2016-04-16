var httpResponseService = function() {

  var _assembleMessage = function(prefix, fields) {

    var message = prefix;
    fields.forEach(function(field) {
      message += field + ', ';
    });

    return message.slice(0, -2);

  };

  var hasRequiredFields = function(data, requiredFields) {

    return requiredFields.every(function(requiredField) {
      return typeof data[requiredField] !== 'undefined'
    });

  };

  var getMissingFieldsResponse = function(requiredFields) {

    return {
      status: 422,
      message: _assembleMessage('The following fields are required: ', requiredFields)
    }

  };

  return {
    hasRequiredFields: hasRequiredFields,
    getMissingFieldsResponse: getMissingFieldsResponse
  }

};

module.exports = httpResponseService;
