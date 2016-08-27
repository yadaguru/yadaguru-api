var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var User = models.User;
var School = models.School;
var Reminder = models.Reminder;


describe('/api/users', function() {
  describe('POST', function() {
    beforeEach(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create({phoneNumber: '9876543210'}).then(function() {
          done();
        })
      });
    });

    it('should respond with new user id when phone number is valid and does not exist', function(done) {
      var json = { phoneNumber: '1234567890' };

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

    it('should updated user id when phone number is valid and already exists', function(done) {
      var json = { phoneNumber: '9876543210' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('userId', 1);
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

  xdescribe('PUT', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create({phoneNumber: '1234567890'}).then(function() {
          done();
        })
      });
    });

    it('should respond with the updated user on successful update', function(done) {
      var json = { confirmCode: '123456' };

      request(app)
        .put('/api/users/1')
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

    it('should respond with a 404 if the user does not exist', function(done) {
      var json = { confirmCode: '123456' };

      request(app)
        .put('/api/users/2')
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('User with id 2 not found');
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
  });

  xdescribe('DELETE', function() {

    beforeEach(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create({phoneNumber: '1234567890'}).then(function() {
          School.create({
            userId: 1,
            name: 'Temple',
            dueDate: '2017-02-01',
            isActive: 'true'
          }).then(function() {
            Reminder.create({
              schoolId: 1,
              userId: 1,
              name: 'foo',
              message: 'bar',
              detail: 'foobar',
              timeframe: '1 week before',
              dueDate: '2017-02-01'
            }).then(function() {
              done();
            })
          });
        })
      });
    });

    it('should respond with the deleted user id on successful delete', function(done) {
      request(app)
        .delete('/api/users/1')
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
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          School.findAll({where: {userId: 1}}).then(function(schoolResp) {
            schoolResp.should.deep.equal([]);
            Reminder.findAll({where: {userId: 1}}).then(function(reminderResp) {
              reminderResp.should.deep.equal([]);
              done();
            })
          })
        })
    });

    it('should respond with a 404 if the user does not exist', function(done) {
      request(app)
        .delete('/api/users/2')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('User with id 2 not found');
          done();
        });
    });

  });
});
