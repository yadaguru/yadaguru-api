var request = require('supertest');
var assert = require('chai').assert;
var app = require('../../app.js');
var membership = app.get('db').membership;

describe('/api/users', function() {
  beforeEach(function(done) {
    membership.users.destroy({}, function(err) {
      if (err) return done(err);
      done();
    });
  });
  
  describe('POST', function() {
    it('should respond with user id when phone number is valid', function(done) {
      var json = { phoneNumber: '1111111111' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          assert.property(res.body, 'id');
          done();
        });
    });
    it('should respond with error when phone number already exists', function(done) {
      var json = { phoneNumber: '1111111111' };
      
      membership.register([json.phoneNumber], function() {
        request(app)
          .post('/api/users')
          .type('json')
          .send(json)
          .expect(409) //TODO: Check for SOME id numeric returned & message
          .end(function(err, res) {
            if (err) return done(err);
            assert.equal(res.body.error, 'Phone number exists');
            done();
          });
      });
    });
    it('should respond with error when phone number is not ten digits', function(done) {
      var json = { phoneNumber: '12345678901' }
      
      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(400) //TODO: Check for SOME id numeric returned & message
        .end(function(err, res) {
          if (err) return done(err);
          assert.equal(res.body.error, 'Invalid Phone Number: Must be 10 digits');
          done();
        });
    });
    
    it('should respond with error when phone number contains letters', function(done) {
      var json = { phoneNumber: '123456e890' }
      
      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(400) //TODO: Check for SOME id numeric returned & message
        .end(function(err, res) {
          if (err) return done(err);
          assert.equal(res.body.error, 'Invalid Phone Number: Must be 10 digits');
          done();
        });
    });
  });
});
