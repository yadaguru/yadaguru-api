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


describe('/api/users', function() {
  describe('GET', function() {
    var users = [{
      phoneNumber: '1234567890',
      confirmCode: '123456'
    }, {
      phoneNumber: '9876543210',
      confirmCode: '654321'
    }];

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create(users[0]).then(function() {
          User.create(users[1]).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with all users', function(done) {
      request(app)
        .get('/api/users')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('phoneNumber', '1234567890');
          res.body[1].should.have.property('phoneNumber', '9876543210');
          done();
        });
    });

    it('should respond with requested user object', function(done) {
      request(app)
        .get('/api/users/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('phoneNumber', users[0].phoneNumber);
          res.body[0].should.have.property('confirmCode', users[0].confirmCode);
          done();
        });
    });

    it('should respond with a 404 if the user object does not exist', function(done) {
      request(app)
        .get('/api/users/3')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('User with id 3 not found');
          done();
        })
    })
  });


  describe('POST', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        done();
      });
    });

    it('should respond with user id when phone number is valid', function(done) {
      var json = { phoneNumber: '1234567890' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('phoneNumber', '1234567890');
          done();
        });
    });
    it('should respond with error when phone number already exists', function(done) {
      var json = { phoneNumber: '1234567890' };

      request(app)
        .post('/api/users')
        .type('json')
        .send(json)
        .expect(500)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.name.should.be.equal('SequelizeUniqueConstraintError');
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
      var json = { phoneNumber: '123456e890' }

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

  describe('PUT', function() {

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

  describe('DELETE', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        User.create({phoneNumber: '1234567890'}).then(function() {
          done();
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
