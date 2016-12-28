var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var config = require('../../config/config')[env];
var models = require('yadaguru-data')(config).models;
var mockData = require('../mockData')(models);
var moment = require('moment');
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongUser = jwt.sign({userId: 2, role: 'user'}, 'development_secret', {noTimestamp: true});

describe('/api/schools', function() {
  var schools = mockData.schools;

  beforeEach(function(done) {
    models.sequelize.sync({force: true}).then(function() {
      mockData.createMockData().then(function() {
        done();
      })
    })
  });

  describe('GET', function() {
    it('should respond with all schools', function(done) {
      request(app)
        .get('/api/schools')
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer not a valid token')
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
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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
        .set('Authorization', 'Bearer ' + tokenWrongUser)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 1 not found');
          done();
        })
    });
  });


  describe('POST', function() {
    it('should respond with school id when valid data is submitted', function(done) {
      var json = {
        name: 'University of Pennsylvania',
        dueDate: '2017-02-01',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 3);
          res.body[0].should.have.property('userId', 1);
          res.body[0].should.have.property('name', json.name);
          res.body[0].should.have.property('isActive', true);
          res.body[0].should.have.property('dueDate', json.dueDate);
          done();
        });
    });

    it('should generate reminders for the school, and save them to the reminders table', function(done) {
      var json = {
        name: 'University of Pennsylvania',
        dueDate: '2017-02-01',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .end(function(err, res) {
          if (err) return done(err);
          models.Reminder.findAll().then(function(res) {
            res[6].dataValues.should.have.property('schoolId', 3);
            res[6].dataValues.should.have.property('userId', 1);
            res[6].dataValues.should.have.property('baseReminderId', 1);
            res[7].dataValues.should.have.property('baseReminderId', 1);
            res[8].dataValues.should.have.property('baseReminderId', 2);
            res[6].dataValues.should.have.property('timeframe', 'Today');
            res[7].dataValues.should.have.property('timeframe', '30 Days Before');
            res[8].dataValues.should.have.property('timeframe', 'January 1');
            moment.utc(res[6].dataValues.dueDate).format('YYYY-MM-DD').should.equal(moment.utc().format('YYYY-MM-DD'));
            moment.utc(res[7].dataValues.dueDate).format('YYYY-MM-DD').should.equal('2017-01-02');
            moment.utc(res[8].dataValues.dueDate).format('YYYY-MM-DD').should.equal('2017-01-01');
            done();
          })
        })

    });

    it('should respond with error if all required fields is not present', function(done) {
      var json = {
        name: 'Temple',
        isActive: 'true'
      };

      request(app)
        .post('/api/schools')
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'invalid token')
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
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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
    it('should respond with the updated school on successful update', function(done) {
      var json = {
        name: 'Drexel'
      };

      request(app)
        .put('/api/schools/1')
        .set('Authorization', 'Bearer ' + token)
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
        .put('/api/schools/3')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('School with id 3 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/schools/1')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'Temple');
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
        .set('Authorization', 'Bearer not a valid token')
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
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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
        .set('Authorization', 'Bearer ' + tokenWrongUser)
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
    it('should respond with the deleted school id on successful delete', function(done) {
      request(app)
        .delete('/api/schools/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should delete associated reminders when school is deleted', function(done) {
      request(app)
        .delete('/api/schools/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          models.Reminder.findAll({where: {schoolId: 1}}).then(function(res) {
            res.should.deep.equal([]);
            done();
          })
        });
    });

    it('should respond with a 404 if the school does not exist', function(done) {
      request(app)
        .delete('/api/schools/3')
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 3 not found');
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
        .set('Authorization', 'Bearer not a valid token')
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
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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
        .set('Authorization', 'Bearer ' + tokenWrongUser)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('School with id 1 not found');
          done();
        })
    });
  });
});
