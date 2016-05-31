var request = require('supertest');
var app = require('../../app.js');

describe('/api/users', function() {
  describe('POST', function() {
    it('should respond with user id when phone number is valid', function(done) {
      var json = { phoneNumber: '1111111111' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(200) //TODO: Check for SOME id numeric returned & message
        .end(function(err, res) {
          if (err) return done(err);
          done();
        });
    });
  });
});
