var request = require('supertest');
var app = require('../../server.js');

describe('POST /api/users', function() {
  it('should respond with user id when phone number is valid', function(done) {
    var phoneNumber = { phoneNumber: '1111111111' };

    request(app)
      .post('/api/users')
      .type('json')
      .send(phoneNumber)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });
});
