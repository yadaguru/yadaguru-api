var assert = require('assert');
var helpers = require('./helpers');

var user = {};

describe('Authentication', function() {
  before(function(done) {
    helpers.initDb(function(err, res) {
      helpers.register({
        phone_number: '1234567890'
      }, function(err, res) {
        helpers.db.membership.validate_account(
            [res.phone_number, res.phone_number_validation_token, '123456'], function(err, res) {
          user = res;
          done();
        });
      });
    });
  });

  describe('valid authentication', function() {
    var authResult = {};
    before(function(done) {
      helpers.db.membership.authenticate(['1234567890', '123456', '127.0.0.1'], function(err, res) {
        authResult = res[0];
        done();
      });
    });
    it('is successful', function() {
      assert.ok(authResult.success);
    });
    it('returns a session_id', function() {
      assert.ok(authResult.session_id);
    });
    it('returns a user record', function() {
      assert.ok(authResult.user_id);
    });
  });

  describe('invalid authentication', function() {
    var authResult = {};
    before(function(done) {
      helpers.db.membership.authenticate(['1234567890', 'poop', '127.0.0.1'], function(err, res) {
        authResult = res[0];
        done();
      });
    });
    it('is not successful', function() {
      assert.ok(!authResult.success);
    });
    it('provides a message', function() {
      assert.equal(authResult.message, 'Invalid phone number or password');
    });
  });
});
