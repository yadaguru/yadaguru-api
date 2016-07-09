var validationService = function() {

  var hasMissingFields = function(values, requiredFields) {
    var fields = Object.keys(values);
    var missingFields = requiredFields.filter(function(requiredField) {
      return fields.indexOf(requiredField) === -1;
    });
    return missingFields.length > 0 ? missingFields : false;
  };

  return {
    hasMissingFields: hasMissingFields
  }

};

module.exports = validationService();
