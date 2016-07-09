var errorService = function() {

  var ApiError = function(message, status, fields) {
    this.name = 'ApiError';
    this.message = message || 'Unspecified DataError';
    this.status = status || 400;

    if (Array.isArray(fields)) {
      fields.unshift(this.message);
      this.message = fields.join(' ');
    }
  };
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  var makeError = function(errorName, status, fields) {
    switch(errorName) {
      case 'SequelizeUniqueConstraintError':
        return new ApiError('Resource already exists', 409);
      default:
        return new ApiError(errorName, status, fields);
    }
  };

  return {
    ApiError: ApiError,
    makeError: makeError
  }
};

module.exports = errorService();
