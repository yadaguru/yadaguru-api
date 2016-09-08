var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var BaseReminder = models.BaseReminder;
var Timeframe = models.Timeframe;
var Category = models.Category;
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});


describe('/api/base_reminders', function() {
  var timeframes = [{
    name: 'Today',
    type: 'now'
  }, {
    name: '7 Days Before',
    type: 'relative',
    formula: '7'
  }];

  var categories = [{
    name: 'Essays'
  }, {
    name: 'Recommendations'
  }];

  var baseReminders = [{
    name: 'Write Essay',
    message: 'Better get writing!',
    detail: 'Some help for writing your essay',
    lateMessage: 'Too late',
    lateDetail: 'Should have started sooner',
    categoryId: 1
  }, {
    name: 'Get Recommendations',
    message: 'Ask your counselor',
    detail: 'Tips for asking your counselor',
    lateMessage: 'Too late',
    lateDetail: '',
    categoryId: 2
  }];

  describe('GET', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Timeframe.bulkCreate(timeframes).then(function() {
          Category.bulkCreate(categories).then(function() {
            BaseReminder.create(baseReminders[0]).then(function(br) {
              br.setTimeframes([1, 2]).then(function() {
                BaseReminder.create(baseReminders[1]).then(function(br) {
                  br.setTimeframes([1]).then(function() {
                    done();
                  })
                })
              })
            })
          })
        })
      })
    });

    it('should respond with all baseReminders', function(done) {
      request(app)
        .get('/api/base_reminders')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('name', 'Write Essay');
          res.body[0].should.have.property('categoryId', 1);
          res.body[1].should.have.property('name', 'Get Recommendations');
          res.body[1].timeframeIds.should.deep.equal([1]);
          done();
        });
    });

    it('should respond with requested baseReminder object', function(done) {
      request(app)
        .get('/api/base_reminders/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('message', baseReminders[0].message);
          done();
        });
    });

    it('should respond with a 404 if the baseReminder object does not exist', function(done) {
      request(app)
        .get('/api/base_reminders/3')
        .set('Bearer', token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('BaseReminder with id 3 not found');
          done();
        })
    })

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .get('/api/base_reminders/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .get('/api/base_reminders/1')
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
        .get('/api/base_reminders/1')
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
        Timeframe.bulkCreate(timeframes).then(function() {
          Category.bulkCreate(categories).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with baseReminder id when valid data is submitted', function(done) {
      var json = {
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: '1'
      };

      request(app)
        .post('/api/base_reminders')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name', 'Write Essay');
          res.body[0].timeframeIds.should.deep.equal([1, 2]);
          done();
        });
    });

    it('should respond with error if required fields are is not present', function(done) {
      var json = {
        name: 'Write Essay',
        message: 'Better get writing!',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: [1, 2],
        categoryId: '1'
      };

      request(app)
        .post('/api/base_reminders')
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

    it('should respond with error if required fields are invalid', function(done) {
      var json = {
        name: 'Write Essay',
        message: 'Better get writing!',
        detail: 'Some help for writing your essay',
        lateMessage: 'Too late',
        lateDetail: 'Should have started sooner',
        timeframeIds: '1, 2',
        categoryId: 'Essay'
      };

      request(app)
        .post('/api/base_reminders')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('categoryId must be a number. timeframeIds must be an array of timeframe IDs. ');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .post('/api/base_reminders')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .post('/api/base_reminders')
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
        .post('/api/base_reminders')
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
        Timeframe.bulkCreate(timeframes).then(function() {
          Category.bulkCreate(categories).then(function() {
            BaseReminder.create(baseReminders[0]).then(function(br) {
              br.setTimeframes([1, 2]).then(function() {
                done();
              })
            })
          })
        })
      })
    });

    it('should respond with the updated baseReminder on successful update', function(done) {
      var json = { name: 'Write Essays' };

      request(app)
        .put('/api/base_reminders/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'Write Essays');
          done();
        });
    });

    it('should respond with a 404 if the baseReminder does not exist', function(done) {
      var json = { name: 'Write Essays' };

      request(app)
        .put('/api/base_reminders/2')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('BaseReminder with id 2 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/base_reminders/1')
        .set('Bearer', token)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'Write Essays');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .put('/api/base_reminders/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .put('/api/base_reminders/1')
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
        .put('/api/base_reminders/1')
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

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Timeframe.bulkCreate(timeframes).then(function() {
          Category.bulkCreate(categories).then(function() {
            BaseReminder.create(baseReminders[0]).then(function(br) {
              br.setTimeframes([1, 2]).then(function() {
                done();
              })
            })
          })
        })
      })
    });

    it('should respond with the deleted baseReminder id on successful delete', function(done) {
      request(app)
        .delete('/api/base_reminders/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should respond with a 404 if the baseReminder does not exist', function(done) {
      request(app)
        .delete('/api/base_reminders/2')
        .set('Bearer', token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('BaseReminder with id 2 not found');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .delete('/api/base_reminders/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .delete('/api/base_reminders/1')
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
        .delete('/api/base_reminders/1')
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
