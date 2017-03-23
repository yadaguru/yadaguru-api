var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var sinon = require('sinon');
var app = require('../../app.js');
var config = require('../../config/config')[env];
var models = require('yadaguru-data')(config).models;
var mockData = require('../mockData')(models);
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
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{
            dueDate: '2017-01-31',
            reminders: [{
              id: [1, 4],
              detail: 'Should have started sooner',
              message: 'Too late. Application was due on 2/1/2017',
              name: 'Write Essay'
            }, {
              detail: 'Should have started sooner',
              id: [2, 5],
              message: 'Too late. Application was due on 2/1/2017',
              name: 'Write Essay'
            }]
          }]);
          done();
        });
    });

    it('should respond with all reminders grouped and sorted by dueDate for the school id', function(done) {
      request(app)
        .get('/api/reminders/school/1')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal({
            schoolName: 'Temple',
            reminders: [{
              dueDate: '2017-01-31',
              reminders: [{
                id: 1,
                detail: 'Should have started sooner',
                message: 'Too late. Application was due on 2/1/2017',
                name: 'Write Essay'
              }, {
                id: 2,
                detail: 'Should have started sooner',
                message: 'Too late. Application was due on 2/1/2017',
                name: 'Write Essay'
              }]
            }]
          });
          done();
        });
    });

    it('should respond with all reminders for a specific day', function(done) {
      request(app)
        .get('/api/reminders/date/20170101')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{
            dueDate: '2017-01-01',
            id: [3, 6],
            timeframe: 'January 1',
            name: 'Get Recommendations',
            message: 'Ask your counselor by 1/1/2017',
            detail: 'Tips for asking your counselor',
            lateMessage: 'Too late',
            lateDetail: '',
            category: 'Recommendations',
            baseReminderId: 2,
            schoolName: 'Temple and Drexel',
            schoolId: [1, 2],
            schoolDueDate: '2017-02-01T00:00:00.000Z',
            userId: 1
          }]);
          done();
        });
    });

    it('should respond with requested reminder object', function(done) {
      request(app)
        .get('/api/reminders/1')
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .get('/api/reminders/1')
        .set('Authorization', 'Bearer ' + tokenWrongRole)
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
        .set('Authorization', 'Bearer ' + tokenWrongUser)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Reminder with id 1 not found');
          done();
        })
    });
  });
});
