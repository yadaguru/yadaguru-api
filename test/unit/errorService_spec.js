var chai = require('chai');
chai.should();

var Errors = require('../../services/errorService');

describe('The ApiError', function() {

  var ApiError = Errors.ApiError;

  it('should have a default message and status if created with no arguments', function() {
    var apiError = new ApiError();
    apiError.should.have.property('name', 'ApiError');
    apiError.should.have.property('message', 'Unspecified DataError');
    apiError.should.have.property('status', 400);
  });

  it('should allow passing in a string and number for message/status', function() {
    var apiError = new ApiError('foobar', 404);
    apiError.should.have.property('message', 'foobar');
    apiError.should.have.property('status', 404);
  });

  it('should allow passing in an array of fields', function() {
    var apiError = new ApiError('Missing fields', 400, ['foo', 'bar', 'bazz']);
    apiError.should.have.property('message', 'Missing fields foo bar bazz');
  });

});

describe('The makeError method', function() {

  it('should return a `Resource already exists` 409 error when passed a unique constraint error name', function() {
    var apiError = Errors.makeError('SequelizeUniqueConstraintError');
    apiError.should.have.property('message', 'Resource already exists');
    apiError.should.have.property('status', 409);
  });

  it('should return a 400 error with a passed-in, non-specific message', function() {
    var apiError = Errors.makeError('a non-specific error message');
    apiError.should.have.property('message', 'a non-specific error message');
    apiError.should.have.property('status', 400);
  });

  it('should return a 400 error and a generic message if called with no arguments', function() {
    var apiError = Errors.makeError();
    apiError.should.have.property('message', 'Unspecified DataError');
    apiError.should.have.property('status', 400);
  });

  it('should handle an array of fields for the third parameter and include them in the message', function() {
    var apiError = Errors.makeError('Missing fields:', 400, ['foo', 'bar', 'bazz']);
    apiError.should.have.property('message', 'Missing fields: foo bar bazz');
  })

});
