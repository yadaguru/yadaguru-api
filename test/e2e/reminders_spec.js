var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var sinon = require('sinon');
var app = require('../../app.js');
var models = require('../../models');
var mockData = require('../mockData');
var moment = require('moment');
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});
var tokenWrongRole = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenWrongUser = jwt.sign({userId: 2, role: 'user'}, 'development_secret', {noTimestamp: true});


describe('/api/reminders', function() {
  var reminders = mockData.groupedReminders;

  beforeEach(function(done) {
    this.clock = sinon.useFakeTimers();
    this.clock.tick(moment.utc('2017-02-01').valueOf());
    models.sequelize.sync({force: true}).then(function() {
      mockData.createMockData().then(function() {
        done();
      })
    });
  });

  afterEach(function(done) {
    this.clock.restore();
    done();
  });

  describe('GET', function() {
    it('should respond with all grouped & sorted by duedate reminders', function(done) {
      request(app)
        .get('/api/reminders')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{
            dueDate: '2016-09-01',
            reminders: [{
              detail: 'Some help for writing your Temple and Drexel essay for Temple and Drexel',
              id: [1, 4],
              lateDetail: 'Should have started sooner',
              lateMessage: 'Too late. Application was due on 2/1/2017',
              message: 'Better get writing!',
              name: 'Write Essay'
            }]
          }, {
            dueDate: '2017-01-01',
            reminders: [{
              detail: 'Tips for asking your counselor',
              id: [3, 6],
              lateDetail: '',
              lateMessage: 'Too late',
              message: 'Ask your counselor by 1/1/2017',
              name: 'Get Recommendations'
            }]
          }, {
            dueDate: '2017-01-02',
            reminders: [{
              detail: 'Some help for writing your Temple and Drexel essay for Temple and Drexel',
              id: [2, 5],
              lateDetail: 'Should have started sooner',
              lateMessage: 'Too late. Application was due on 2/1/2017',
              message: 'Better get writing!',
              name: 'Write Essay'
            }]
          }, {
            dueDate: '2017-02-01',
            reminders: [{
              detail: 'SAT admin detail',
              id: 1,
              lateDetail: '',
              lateMessage: '',
              message: 'SAT admin message',
              name: 'SAT test today',
            }]
          }, {
            dueDate: '2017-02-15',
            reminders: [{
              detail: 'ACT admin detail',
              id: 2,
              lateDetail: '',
              lateMessage: '',
              message: 'ACT admin message',
              name: 'ACT test today',
            }]
          }]);
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
          res.body.should.deep.equal([{
            dueDate: '2016-09-01',
            reminders: [{
              detail: 'Some help for writing your Temple essay for Temple',
              id: 1,
              lateDetail: 'Should have started sooner',
              lateMessage: 'Too late. Application was due on 2/1/2017',
              message: 'Better get writing!',
              name: 'Write Essay'
            }]
          }, {
            dueDate: '2017-01-01',
            reminders: [{
              detail: 'Tips for asking your counselor',
              id: 3,
              lateDetail: '',
              lateMessage: 'Too late',
              message: 'Ask your counselor by 1/1/2017',
              name: 'Get Recommendations'
            }]
          }, {
            dueDate: '2017-01-02',
            reminders: [{
              detail: 'Some help for writing your Temple essay for Temple',
              id: 2,
              lateDetail: 'Should have started sooner',
              lateMessage: 'Too late. Application was due on 2/1/2017',
              message: 'Better get writing!',
              name: 'Write Essay'
            }]
          }, {
            dueDate: '2017-02-01',
            reminders: [{
              detail: 'SAT admin detail',
              id: 1,
              lateDetail: '',
              lateMessage: '',
              message: 'SAT admin message',
              name: 'SAT test today',
            }]
          }, {
            dueDate: '2017-02-15',
            reminders: [{
              detail: 'ACT admin detail',
              id: 2,
              lateDetail: '',
              lateMessage: '',
              message: 'ACT admin message',
              name: 'ACT test today',
            }]
          }]);
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
          res.body[0].should.have.property('name', 'Write Essay');
          res.body[0].should.have.property('message', 'Better get writing!');
          res.body[0].should.have.property('detail', 'Some help for writing your Temple essay for Temple');
          res.body[0].should.have.property('lateMessage', 'Too late. Application was due on 2/1/2017');
          res.body[0].should.have.property('lateDetail', 'Should have started sooner');
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

    it('should respond with an empty array if no reminders belong to the school ID (but will still return test reminders', function(done) {
      request(app)
        .get('/api/reminders/school/3')
        .set('Bearer', token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{
            dueDate: '2017-02-01',
            reminders: [{
              detail: 'SAT admin detail',
              id: 1,
              lateDetail: '',
              lateMessage: '',
              message: 'SAT admin message',
              name: 'SAT test today'
            }]
          }, {
            dueDate: '2017-02-15',
            reminders: [{
              detail: 'ACT admin detail',
              id: 2,
              lateDetail: '',
              lateMessage: '',
              message: 'ACT admin message',
              name: 'ACT test today'
            }]
          }]);
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
