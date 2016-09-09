var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var TestDate = models.TestDate;
var Test = models.Test;
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});


describe('/api/tests', function() {
  var tests = [{
    type: 'SAT',
    message: 'A message',
    detail: 'Some details'
  }, {
    type: 'ACT',
    message: 'A message',
    detail: 'Some details'
  }];

  describe('GET', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Test.create(tests[0]).then(function() {
          Test.create(tests[1]).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with all tests', function(done) {
      request(app)
        .get('/api/tests')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('type', tests[0].type);
          res.body[1].should.have.property('message', tests[1].message);
          res.body[0].should.have.property('detail', tests[0].detail);
          done();
        });
    });

    it('should respond with requested test object', function(done) {
      request(app)
        .get('/api/tests/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('type', tests[0].type);
          res.body[0].should.have.property('message', tests[0].message);
          res.body[0].should.have.property('detail', tests[0].detail);
          done();
        });
    });

    it('should respond with a 404 if the test object does not exist', function(done) {
      request(app)
        .get('/api/tests/3')
        .set('Bearer', token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Test with id 3 not found');
          done();
        })
    })

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .get('/api/tests/3')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .get('/api/tests/3')
        .set('Bearer', 'not a valid token')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user does not have the correct role for the route', function(done) {
      request(app)
        .get('/api/tests/3')
        .set('Bearer', tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });
  });


  describe('POST', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        done();
      });
    });

    it('should respond with test id when valid data is submitted', function(done) {
      var json = {
        type: 'SAT',
        message: 'A message',
        detail: 'Some details'
      };

      request(app)
        .post('/api/tests')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('type', json.type);
          res.body[0].should.have.property('message', json.message);
          res.body[0].should.have.property('detail', json.detail);
          done();
        });
    });

    it('should respond with error if all required fields is not present', function(done) {
      var json = {
        type: 'SAT',
        message: 'A message'
      };

      request(app)
        .post('/api/tests')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('detail is required. ');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .post('/api/tests')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .post('/api/tests')
        .set('Bearer', 'not a valid token')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user does not have the correct role for the route', function(done) {
      request(app)
        .post('/api/tests')
        .set('Bearer', tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });
  });

  describe('PUT', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Test.create(tests[0]).then(function() {
          done();
        })
      });
    });

    it('should respond with the updated test on successful update', function(done) {
      var json = {
        message: 'An updated message'
      };

      request(app)
        .put('/api/tests/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('type', 'SAT');
          res.body[0].should.have.property('message', 'An updated message');
          res.body[0].should.have.property('detail', 'Some details');
          done();
        });
    });

    it('should respond with a 404 if the test does not exist', function(done) {
      var json = {
        message: 'An updated message'
      };

      request(app)
        .put('/api/tests/2')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('Test with id 2 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/tests/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('type', 'SAT');
          res.body[0].should.have.property('message', 'An updated message');
          res.body[0].should.have.property('detail', 'Some details');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .put('/api/tests/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .put('/api/tests/1')
        .set('Bearer', 'not a valid token')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user does not have the correct role for the route', function(done) {
      request(app)
        .put('/api/tests/1')
        .set('Bearer', tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });
  });

  describe('DELETE', function() {

    beforeEach(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Test.create(tests[0]).then(function() {
          done();
        })
      });
    });

    it('should respond with the deleted test id on successful delete', function(done) {
      request(app)
        .delete('/api/tests/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should fail if test is associated with a test date', function(done) {
      TestDate.create({
        testId: 1,
        registrationDate: '2017-01-01',
        adminDate: '2017-02-01'
      }).then(function() {
        request(app)
          .delete('/api/tests/1')
          .set('Bearer', token)
          .expect(409)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.message.should.be.equal('Test is being used by another resource');
            done();
          })
      })
    });

    it('should respond with a 404 if the test does not exist', function(done) {
      request(app)
        .delete('/api/tests/2')
        .set('Bearer', token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Test with id 2 not found');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .delete('/api/tests/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .delete('/api/tests/1')
        .set('Bearer', 'not a valid token')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the user does not have the correct role for the route', function(done) {
      request(app)
        .delete('/api/tests/1')
        .set('Bearer', tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

  });
});
