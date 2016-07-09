var errorService = function() {

  var ApiError = function(message, status) {
    this.name = 'ApiError';

    if (Array.isArray(message)) {
      this.message = message.reduce(function(fullMessage, messagePart) {
        return fullMessage + messagePart + ', ';
      }, '').slice(0, -2);
    } else {
      this.message = message || 'Unspecified DataError';
    }

    this.status = status || 400;
  };
  ApiError.prototype = Object.create(Error.prototype);
  ApiError.prototype.constructor = ApiError;

  var makeError = function(errorName) {
    switch(errorName) {
      case 'SequelizeUniqueConstraintError':
        return new ApiError('Resource already exists', 409);
      default:
        return new ApiError(errorName, 400);
    }
  };

  return {
    ApiError: ApiError,
    makeError: makeError
  }
};

module.exports = errorService();
