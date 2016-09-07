var chai = require('chai');
chai.should();

var errors = require('../../services/errorService');

describe('Errors', function() {
  describe('ResourceNotFoundError', function() {
    it('should have properties name, message, resource, and resourceId corresponding with the called args', function() {
      try {
        throw new errors.ResourceNotFoundError('User', 1);
      } catch (e) {
        e.name.should.equal('ResourceNotFoundError');
        e.message.should.equal('User with id 1 not found');
        e.resource.should.equal('User');
        e.resourceId.should.equal(1);
      }
    });
  });
  describe('ValidationError', function() {
    it('should have properties name, message, errors, with message containing a concatenation of info from the passed-in errors object', function() {
      var errorObjs = [
        {
          field: 'phoneNumber',
          message: 'must be a number'
        }, {
          field: 'confirmCode',
          message: 'must be 6 digits long'
        }
      ];
      try {
        throw new errors.ValidationError(errorObjs);
      } catch (e) {
        e.name.should.equal('ValidationError');
        e.message.should.equal('phoneNumber must be a number. confirmCode must be 6 digits long. ');
      }
    });
  });
  describe('ForeignConstraintError', function() {
    it('should have properties name, message, and resource corresponding with the called args', function() {
      try {
        throw new errors.ForeignConstraintError('User');
      } catch (e) {
        e.name.should.equal('ForeignConstraintError');
        e.message.should.equal('User is being used by another resource');
        e.resource.should.equal('User');
      }
    });
  });
  describe('LoginError', function() {
    it('should have set properties name and message', function() {
      try {
        throw new errors.LoginError();
      } catch (e) {
        e.name.should.equal('LoginError');
        e.message.should.equal('Login Failed: confirmCode is not valid or has expired');
      }
    });
  });
  describe('NotAuthorizedError', function() {
    it('should have set properties name and message', function() {
      try {
        throw new errors.NotAuthorizedError();
      } catch (e) {
        e.name.should.equal('NotAuthorizedError');
        e.message.should.equal('Not Authorized: You do not have permission to access this resource');
      }
    });
  })
  describe('AdminLoginError', function() {
    it('should have set properties name and message', function() {
      try {
        throw new errors.AdminLoginError();
      } catch (e) {
        e.name.should.equal('AdminLoginError');
        e.message.should.equal('Login Failed: username and/or password is incorrect');
      }
    });
  });
});
