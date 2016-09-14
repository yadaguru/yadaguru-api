var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var mockData = require('../mockData');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongUser = jwt.sign({userId: 2, role: 'user'}, 'development_secret', {noTimestamp: true});


describe('/api/users', function() {

  beforeEach(function(done) {
    models.sequelize.sync({force: true}).then(function() {
      mockData.createMockData().then(function() {
        done();
      })
    })
  });

  describe('POST', function() {
    it('should respond with new user id when phone number is valid and does not exist', function(done) {
      var json = { phoneNumber: '2158675309' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('userId', 3);
          done();
        });
    });

    it('should updated user id when phone number is valid and already exists', function(done) {
      var json = { phoneNumber: '9876543210' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('userId', 2);
          done();
        });
    });

    it('should respond with error when phone number is not ten digits', function(done) {
      var json = { phoneNumber: '12345678901' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('phoneNumber must be a string of 10 digits. ');
          done();
        });
    });

    it('should respond with error when phone number contains letters', function(done) {
      var json = { phoneNumber: '123456e890' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('phoneNumber must be a string of 10 digits. ');
          done();
        });
    });

    it('should respond with error phone number field is not present', function(done) {
      var json = { foo: 'bar' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('phoneNumber is required. ');
          done();
        });
    });
  });

  describe('PUT', function() {
    var token = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});

    beforeEach(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        models.User.bulkCreate([{
          phoneNumber: '1234567890',
          confirmCode: '123456',
          confirmCodeTimestamp: moment.utc().subtract(10, 'seconds').format()
        }, {
          phoneNumber: '9876543210',
          confirmCode: '654321',
          confirmCodeTimestamp: moment.utc().subtract(90, 'seconds').format()
        }]).then(function() {
          done();
        })
      });
    });

    it('should respond with a JWT when PUTing a confirm code, and the confirm code is valid/not expired', function(done) {
      var json = { confirmCode: '123456' };

      request(app)
        .put('/api/users/1')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('token', token);
          done();
        });
    });

    it('should respond an error if the confirm code does not match', function(done) {
      var json = { confirmCode: '654321' };

      request(app)
        .put('/api/users/1')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('Login Failed: confirmCode is not valid or has expired');
          done();
        });
    });

    it('should respond an error if the confirm code has expired', function(done) {
      var json = { confirmCode: '654321' };

      request(app)
        .put('/api/users/2')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('Login Failed: confirmCode is not valid or has expired');
          done();
        });
    });

    it('should respond with the updated user on successful update', function(done) {
      var json = { sponsorCode: '123456' };

      request(app)
        .put('/api/users/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('phoneNumber', '1234567890');
          res.body[0].should.have.property('sponsorCode', '123456');
          done();
        });
    });

    it('should respond with a 404 if the user does not exist', function(done) {
      var json = { confirmCode: '123456' };

      request(app)
        .put('/api/users/3')
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('User with id 3 not found');
          done();
        });
    });

    it('should respond with error on validation errors', function(done) {
      // confirm code must be 6 digits
      var json = { confirmCode: '123' };

      request(app)
        .put('/api/users/1')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('confirmCode must be a string of 6 digits. ');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/users/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('phoneNumber', '1234567890');
          res.body[0].should.have.property('confirmCode', '123456');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .put('/api/users/1')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .put('/api/users/1')
        .set('Bearer', 'not a valid token')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user does not have the correct role for the route', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .put('/api/users/1')
        .set('Bearer', tokenWrongRole)
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user attempts to update a different user', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .put('/api/users/1')
        .set('Bearer', tokenWrongUser)
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });
  });

  describe('DELETE', function() {
    it('should respond with the deleted user id on successful delete', function(done) {
      request(app)
        .delete('/api/users/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should delete reminders and schools associated with the user', function(done) {
      request(app)
        .delete('/api/users/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          models.School.findAll({where: {userId: 1}}).then(function(schoolResp) {
            schoolResp.should.deep.equal([]);
            models.Reminder.findAll({where: {userId: 1}}).then(function(reminderResp) {
              reminderResp.should.deep.equal([]);
              done();
            })
          })
        })
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .delete('/api/users/1')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .delete('/api/users/1')
        .set('Bearer', 'not a valid token')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user does not have the correct role for the route', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .delete('/api/users/1')
        .set('Bearer', tokenWrongRole)
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user attempts to update a different user', function(done) {
      var json = {
        sponsorCode: '123456'
      };

      request(app)
        .delete('/api/users/1')
        .set('Bearer', tokenWrongUser)
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

  });
});
