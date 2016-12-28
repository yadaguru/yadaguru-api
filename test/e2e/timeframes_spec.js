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
var Category = models.Category;
var Timeframe = models.Timeframe;
var BaseReminder = models.BaseReminder;
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});


describe('/api/timeframes', function() {
  describe('GET', function() {
    var timeframes = [{
      id: 1,
      name: 'Today',
      type: 'now',
      formula: undefined
    }, {
      id: 2,
      name: 'In 30 Days',
      type: 'relative',
      formula: '30'
    }, {
      id: 3,
      name: 'January 1',
      type: 'absolute',
      formula: '2017-01-01'
    }];

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Timeframe.bulkCreate(timeframes).then(function() {
          done();
        })
      })
    });

    it('should respond with all timeframes', function(done) {
      request(app)
        .get('/api/timeframes')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(3);
          res.body[0].should.have.property('name', 'Today');
          res.body[1].should.have.property('type', 'relative');
          res.body[2].should.have.property('formula', '2017-01-01');
          done();
        });
    });

    it('should respond with requested timeframe object', function(done) {
      request(app)
        .get('/api/timeframes/2')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 2);
          res.body[0].should.have.property('name', timeframes[1].name);
          res.body[0].should.have.property('type', timeframes[1].type);
          res.body[0].should.have.property('formula', timeframes[1].formula);
          done();
        });
    });

    it('should respond with a 404 if the timeframe object does not exist', function(done) {
      request(app)
        .get('/api/timeframes/4')
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Timeframe with id 4 not found');
          done();
        })
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .get('/api/timeframes/2')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .get('/api/timeframes/2')
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
        .get('/api/timeframes/2')
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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

    it('should respond with timeframe id when valid data is submitted', function(done) {
      var json = {
        name: 'In 30 Days',
        type: 'relative',
        formula: '30'
      };

      request(app)
        .post('/api/timeframes')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name', 'In 30 Days');
          res.body[0].should.have.property('type', 'relative');
          res.body[0].should.have.property('formula', '30');
          done();
        });
    });

    it('should respond with error if required fields are not present', function(done) {
      var json = {
        name: 'In 30 Days',
        formula: '30'
      };

      request(app)
        .post('/api/timeframes')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('type is required. ');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .post('/api/timeframes')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .post('/api/timeframes')
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
        .post('/api/timeframes')
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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
        Timeframe.create({
          name: 'In 30 Days',
          type: 'relative',
          formula: '30'
        }).then(function() {
          done();
        })
      });
    });

    it('should respond with the updated timeframe on successful update', function(done) {
      var json = {
        name: 'In 60 Days',
        formula: '60'
      };

      request(app)
        .put('/api/timeframes/1')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'In 60 Days');
          res.body[0].should.have.property('type', 'relative');
          res.body[0].should.have.property('formula', '60');
          done();
        });
    });

    it('should respond with a 404 if the timeframe does not exist', function(done) {
      var json = {
        name: 'In 60 Days',
        formula: '60'
      };

      request(app)
        .put('/api/timeframes/2')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('Timeframe with id 2 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/timeframes/1')
        .set('Authorization', 'Bearer ' + token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'In 60 Days');
          res.body[0].should.have.property('type', 'relative');
          res.body[0].should.have.property('formula', '60');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .put('/api/timeframes/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .put('/api/timeframes/1')
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
        .put('/api/timeframes/1')
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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
        Timeframe.create({
          name: 'In 30 Days',
          type: 'relative',
          formula: '30'
        }).then(function() {
          done();
        })
      });
    });

    it('should respond with the deleted timeframe id on successful delete', function(done) {
      request(app)
        .delete('/api/timeframes/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should fail if timeframe is associated with a base reminder', function(done) {
      Category.create({name: 'foo'}).then(function() {
        BaseReminder.create({
          name: 'foo',
          message: 'bar',
          detail: 'foobar',
          categoryId: '1'
        }).then(function(newBaseReminder) {
          newBaseReminder.setTimeframes([1]).then (function() {
            request(app)
              .delete('/api/timeframes/1')
              .set('Authorization', 'Bearer ' + token)
              .expect(409)
              .end(function(err, res) {
                if (err) return done(err);
                res.body.message.should.be.equal('Timeframe is being used by another resource');
                done();
              });
          });
        });
      });
    });

    it('should respond with a 404 if the timeframe does not exist', function(done) {
      request(app)
        .delete('/api/timeframes/2')
        .set('Authorization', 'Bearer ' + token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Timeframe with id 2 not found');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .delete('/api/timeframes/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .delete('/api/timeframes/1')
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
        .delete('/api/timeframes/1')
        .set('Authorization', 'Bearer ' + tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });
  });
});
