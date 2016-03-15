var assert = require('assert');
var helpers = require('./helpers');

var user = {};

describe('Validation', function() {
  before(function(done) {
    helpers.initDb(function(err, res) {
      helpers.register({
        phone_number: '1234567890'
      }, function(err, res) {
        user = res;
        done();
      });
    });
  });

  describe('valid validation', function() {
    var validationResult = {};
    before(function(done) {
      helpers.db.membership.validate_account(
          [user.phone_number, user.phone_number_validation_token, '123456'], function(err, res) {
        validationResult = res[0];
        done();
      });
    });
    it('is successful', function() {
      assert.ok(validationResult.success);
    });
    it('provides a message', function() {
      assert.equal(validationResult.message, 'Successfully validated and set password');
    });
  });
});