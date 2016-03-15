// #!/usr/local/bin/mocha
var assert = require('assert');
var helpers = require('./helpers');

var goodUser = {
  phone_number: '1234567890'
};

describe('Registration', function() {

  before(function(done) {
    helpers.initDb(done);
  });

  describe('New Registration with valid info', function() {
    var regResult = {};
    before(function(done) {
      //register a user then pull out the info
      helpers.register(goodUser, function(err, res) {
        regResult = res;
        //console.log(res);
        done();
      });
    });
    it('adds a user successfully', function() {
      assert.ok(regResult.success, 'Oops - not registered OK');
      assert.ok(regResult.new_id, 'Don\'t have required return info');
    });
    it('gives a helpful return message', function() {
      assert.equal('Successfully registered', regResult.message, 'Wrong message');
    });
    it('creates log entries', function(done) {
      helpers.db.query('select * from membership.logs where user_id=$1', [regResult.new_id], function(err, res) {
        assert.ok(res.length > 0);
        done();
      });
    });
  });
  describe('Registering an existing user', function() {
    var regResult;
    before(function(done) {
      //register a user then pull out the info
      helpers.register(goodUser, function(err, res) {
        assert(err === null, err);
        //do it again
        helpers.register(goodUser, function(err, res2) {
          assert(err === null, err);
          regResult = res2;
          done();
        });
      });
    });
    it('is not successful', function() {
      assert(!regResult.success, 'Oops - they got in');
    });
    it('gives a reason why', function() {
      assert.equal(regResult.message, 'Phone number exists', regResult.message);
    });
  });
});
