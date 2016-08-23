var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var Reminder = models.Reminder;
var User = models.User;
var School = models.School;


describe('/api/reminders', function() {
  var reminders = [{
    id: '1',
    userId: '1',
    schoolId: '1',
    name: 'Write Essays',
    message: 'Write Your Essays',
    detail: 'More detail about essays',
    lateMessage: 'Your Essays are late',
    lateDetail: 'What to do about late essays',
    dueDate: '2017-02-01',
    timeframe: 'One week before'
  }, {
    id: '2',
    userId: '1',
    schoolId: '2',
    name: 'Get Recommendations',
    message: 'Ask counselor for recommendations',
    detail: 'More detail about recommendations',
    lateMessage: 'Your recommendations are late',
    lateDetail: 'What to do about late recommendations',
    dueDate: '2017-02-01',
    timeframe: 'One week before'
  }];

  var schools = [{
    id: '1',
    userId: '1',
    name: 'Temple',
    dueDate: '2017-02-01',
    isActive: 'true'
  }, {
    id: '2',
    userId: '1',
    name: 'Drexel',
    dueDate: '2017-02-01',
    isActive: 'true'
  }];

  var user = {
    phoneNumber: '1234567890'
  };

  describe('GET', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create(user).then(function() {
          School.bulkCreate(schools).then(function() {
            Reminder.bulkCreate(reminders).then(function() {
              done();
            })
          })
        })
      })
    });

    it('should respond with all reminders', function(done) {
      request(app)
        .get('/api/reminders')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('name', reminders[0].name);
          res.body[1].should.have.property('message', reminders[1].message);
          res.body[0].should.have.property('detail', reminders[0].detail);
          res.body[1].should.have.property('lateMessage', reminders[1].lateMessage);
          res.body[0].should.have.property('lateDetail', reminders[0].lateDetail);
          res.body[1].should.have.property('timeframe', reminders[1].timeframe);
          res.body[0].should.have.property('dueDate', reminders[0].dueDate);
          res.body[1].should.have.property('userId', 1);
          res.body[0].should.have.property('schoolId', 1);
          done();
        });
    });

    it('should respond with all reminders for the school id', function(done) {
      request(app)
        .get('/api/reminders/school/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(1);
          res.body[0].should.have.property('name', reminders[0].name);
          res.body[0].should.have.property('message', reminders[0].message);
          res.body[0].should.have.property('detail', reminders[0].detail);
          res.body[0].should.have.property('lateMessage', reminders[0].lateMessage);
          res.body[0].should.have.property('lateDetail', reminders[0].lateDetail);
          res.body[0].should.have.property('timeframe', reminders[0].timeframe);
          res.body[0].should.have.property('dueDate', reminders[0].dueDate);
          res.body[0].should.have.property('userId', 1);
          res.body[0].should.have.property('schoolId', 1);
          done();
        });
    });

    it('should respond with requested reminder object', function(done) {
      request(app)
        .get('/api/reminders/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('name', reminders[0].name);
          res.body[0].should.have.property('message', reminders[0].message);
          res.body[0].should.have.property('detail', reminders[0].detail);
          res.body[0].should.have.property('lateMessage', reminders[0].lateMessage);
          res.body[0].should.have.property('lateDetail', reminders[0].lateDetail);
          res.body[0].should.have.property('timeframe', reminders[0].timeframe);
          res.body[0].should.have.property('dueDate', reminders[0].dueDate);
          res.body[0].should.have.property('userId', 1);
          res.body[0].should.have.property('schoolId', 1);
          done();
        });
    });

    it('should respond with a 404 if the reminder object does not exist', function(done) {
      request(app)
        .get('/api/reminders/3')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Reminder with id 3 not found');
          done();
        })
    });

    it('should respond with an empty array if no reminders belong to the school ID', function(done) {
      request(app)
        .get('/api/reminders/school/3')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([]);
          done();
        });
    });
  });
});
