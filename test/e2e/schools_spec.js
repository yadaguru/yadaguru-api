var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var School = models.School;
var User = models.User;
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongUser = jwt.sign({userId: 2, role: 'user'}, 'development_secret', {noTimestamp: true});


describe('/api/schools', function() {
  var schools = [{
    id: '1',
    userId: '1',
    name: 'Temple',
    dueDate: '2017-02-01',
    isActive: true
  }, {
    id: '2',
    userId: '1',
    name: 'Drexel',
    dueDate: '2017-02-01',
    isActive: true
  }];

  var user = {
    phoneNumber: '1234567890'
  };

  describe('GET', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create(user).then(function() {
          School.create(schools[0]).then(function() {
            School.create(schools[1]).then(function() {
              done();
            })
          })
        })
      })
    });

    it('should respond with all schools', function(done) {
      request(app)
        .get('/api/schools')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('name', schools[0].name);
          res.body[1].should.have.property('dueDate', schools[1].dueDate);
          res.body[0].should.have.property('isActive', schools[0].isActive);
          res.body[1].should.have.property('userId', 1);
          done();
        });
    });

    it('should respond with requested school object', function(done) {
      request(app)
        .get('/api/schools/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', schools[0].name);
          res.body[0].should.have.property('dueDate', schools[0].dueDate);
          res.body[0].should.have.property('isActive', schools[0].isActive);
          done();
        });
    });

    it('should respond with a 404 if the school object does not exist', function(done) {
      request(app)
        .get('/api/schools/3')
        .set('Bearer', token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 3 not found');
          done();
        })
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .get('/api/schools/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .get('/api/schools/1')
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
        .get('/api/schools/1')
        .set('Bearer', tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 404 if the user attempts to access a school that does not belong to them', function(done) {
      request(app)
        .get('/api/schools/1')
        .set('Bearer', tokenWrongUser)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 1 not found');
          done();
        })
    });
  });


  describe('POST', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create(user).then(function() {
          done();
        });
      });
    });

    it('should respond with school id when valid data is submitted', function(done) {
      var json = {
        name: 'Temple',
        dueDate: '2017-02-01',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('userId', 1);
          res.body[0].should.have.property('name', json.name);
          res.body[0].should.have.property('isActive', true);
          res.body[0].should.have.property('dueDate', json.dueDate);
          done();
        });
    });

    it('should respond with error if all required fields is not present', function(done) {
      var json = {
        name: 'Temple',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('dueDate is required. ');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      var json = {
        name: 'Temple',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        });
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      var json = {
        name: 'Temple',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .set('Bearer', 'invalid token')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        });
    });

    it('should respond with a 401 if the user does not have the correct role for the route', function(done) {
      var json = {
        name: 'Temple',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .set('Bearer', tokenWrongRole)
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        });
    });
  });

  describe('PUT', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create(user).then(function() {
          School.create(schools[0]).then(function() {
            done();
          })
        });
      });
    });

    it('should respond with the updated school on successful update', function(done) {
      var json = {
        name: 'Drexel'
      };

      request(app)
        .put('/api/schools/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'Drexel');
          done();
        });
    });

    it('should respond with a 404 if the school does not exist', function(done) {
      var json = {
        name: 'Drexel'
      };

      request(app)
        .put('/api/schools/2')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('School with id 2 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/schools/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'Drexel');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      var json = {
        name: 'Drexel'
      };

      request(app)
        .put('/api/schools/1')
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
        name: 'Drexel'
      };

      request(app)
        .put('/api/schools/1')
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
        name: 'Drexel'
      };

      request(app)
        .put('/api/schools/1')
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

    it('should respond with a 404 if the user attempts to access a school that does not belong to them', function(done) {
      var json = {
        name: 'Drexel'
      };

      request(app)
        .put('/api/schools/1')
        .set('Bearer', tokenWrongUser)
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 1 not found');
          done();
        })
    });
  });

  describe('DELETE', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create(user).then(function() {
          School.create(schools[0]).then(function() {
            done();
          })
        });
      });
    });

    it('should respond with the deleted school id on successful delete', function(done) {
      request(app)
        .delete('/api/schools/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should respond with a 404 if the school does not exist', function(done) {
      request(app)
        .delete('/api/schools/2')
        .set('Bearer', token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 2 not found');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .delete('/api/schools/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .delete('/api/schools/1')
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
        .delete('/api/schools/1')
        .set('Bearer', tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 404 if the user attempts to access a school that does not belong to them', function(done) {
      request(app)
        .delete('/api/schools/1')
        .set('Bearer', tokenWrongUser)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 1 not found');
          done();
        })
    });

  });
});
