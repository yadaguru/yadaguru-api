module.exports = function() {

  var ResourceNotFoundError = function(resource, resourceId) {
    this.name = 'ResourceNotFoundError';
    this.message = resource + ' with id ' + resourceId + ' not found';
    this.resource = resource;
    this.resourceId = resourceId;
  };
  ResourceNotFoundError.prototype = Object.create(Error.prototype);
  ResourceNotFoundError.prototype.constructor = ResourceNotFoundError;

  var ValidationError = function(errors) {
    if (!Array.isArray(errors)) {
      errors = [errors]
    }
    this.name = 'ValidationError';
    this.message = errors.reduce(function(errorString, error) {
      return errorString + error.field + ' ' + error.message + '. '
    }, '');
    this.errors = errors;
  };
  ValidationError.prototype = Object.create(Error.prototype);
  ValidationError.prototype.constructor = ValidationError;

  var ForeignConstraintError = function(resource) {
    this.name = 'ForeignConstraintError';
    this.message = resource + ' is being used by another resource';
    this.resource = resource;
  };
  ForeignConstraintError.prototype = Object.create(Error.prototype);
  ForeignConstraintError.prototype.constructor = ForeignConstraintError;

  return {
    ResourceNotFoundError: ResourceNotFoundError,
    ValidationError: ValidationError,
    ForeignConstraintError: ForeignConstraintError
  }

}();
