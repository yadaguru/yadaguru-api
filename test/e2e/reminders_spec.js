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
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongUser = jwt.sign({userId: 2, role: 'user'}, 'development_secret', {noTimestamp: true});


describe('/api/reminders', function() {
  var reminders = mockData.groupedReminders;

  beforeEach(function(done) {
    models.sequelize.sync({force: true}).then(function() {
      mockData.createMockData().then(function() {
        done();
      })
    })
  });

  describe('GET', function() {
    it('should respond with all grouped & sorted by duedate reminders', function(done) {
      request(app)
        .get('/api/reminders')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('dueDate', '2016-09-01');
          res.body[1].should.have.property('dueDate', '2017-01-01');
          res.body[2].should.have.property('dueDate', '2017-01-02');
          res.body[0].reminders[0].should.have.property('timeframe', 'Today');
          res.body[0].reminders[1].should.have.property('name', 'Write Essay');
          res.body[1].reminders[0].should.have.property('message', 'Ask your counselor');
          res.body[1].reminders[1].should.have.property('detail', 'Tips for asking your counselor');
          res.body[2].reminders[0].should.have.property('lateMessage', 'Too late');
          res.body[2].reminders[1].should.have.property('lateDetail', 'Should have started sooner');
          res.body[2].reminders[1].should.have.property('category', 'Essays');
          done();
        });
    });

    it('should respond with all reminders grouped and sorted by dueDate for the school id', function(done) {
      request(app)
        .get('/api/reminders/school/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('dueDate', '2016-09-01');
          res.body[1].should.have.property('dueDate', '2017-01-01');
          res.body[2].should.have.property('dueDate', '2017-01-02');
          res.body[0].reminders[0].should.have.property('timeframe', 'Today');
          res.body[0].reminders[0].should.have.property('name', 'Write Essay');
          res.body[1].reminders[0].should.have.property('message', 'Ask your counselor');
          res.body[1].reminders[0].should.have.property('detail', 'Tips for asking your counselor');
          res.body[2].reminders[0].should.have.property('lateMessage', 'Too late');
          res.body[2].reminders[0].should.have.property('lateDetail', 'Should have started sooner');
          res.body[2].reminders[0].should.have.property('category', 'Essays');
          done();
        });
    });

    it('should respond with requested reminder object', function(done) {
      request(app)
        .get('/api/reminders/1')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('timeframe', 'Today');
          res.body[0].should.have.property('name', 'Write Essay');
          res.body[0].should.have.property('message', 'Better get writing!');
          res.body[0].should.have.property('detail', 'Some help for writing your essay');
          res.body[0].should.have.property('lateMessage', 'Too late');
          res.body[0].should.have.property('lateDetail', 'Should have started sooner');
          res.body[0].should.have.property('category', 'Essays');
          done();
        });
    });

    it('should respond with a 404 if the reminder object does not exist', function(done) {
      request(app)
        .get('/api/reminders/7')
        .set('Bearer', token)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Reminder with id 7 not found');
          done();
        })
    });

    it('should respond with an empty array if no reminders belong to the school ID', function(done) {
      request(app)
        .get('/api/reminders/school/3')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([]);
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .get('/api/reminders/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .get('/api/reminders/1')
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
        .get('/api/reminders/1')
        .set('Bearer', tokenWrongRole)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 404 if the user attempts to access a reminder that does not belong to them', function(done) {
      request(app)
        .get('/api/reminders/1')
        .set('Bearer', tokenWrongUser)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Reminder with id 1 not found');
          done();
        })
    });
  });
});
