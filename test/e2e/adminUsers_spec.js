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
var adminUserService = require('yadaguru-data')(config).adminUserService;
var jwt = require('jsonwebtoken');
var token = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});


describe('/api/admin_users', function() {
  describe('POST', function() {
    beforeEach(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        adminUserService.create('admin', 'password').then(function() {
          done();
        })
      });
    });

    it('should respond with a user token if username and password are correct', function(done) {
      var json = {
        userName: 'admin',
        password: 'password'
      };

      request(app)
        .post('/api/admin_users')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('token', token);
          done();
        });
    });

    it('should respond an error if user does not exist', function(done) {
      var json = {
        userName: 'admins',
        password: 'password'
      };

      request(app)
        .post('/api/admin_users')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('Login Failed: username and/or password is incorrect');
          done();
        });
    });

    it('should respond an error if user password is incorrect', function(done) {
      var json = {
        userName: 'admin',
        password: 'passwords'
      };

      request(app)
        .post('/api/admin_users')
        .type('json')
        .send(json)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('Login Failed: username and/or password is incorrect');
          done();
        });
    });

    it('should respond with error userName field is not present', function(done) {
      var json = {
        password: 'password'
      };

      request(app)
        .post('/api/admin_users')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('userName is required. ');
          done();
        });
    });

    it('should respond with error password field is not present', function(done) {
      var json = {
        userName: 'admin'
      };

      request(app)
        .post('/api/admin_users')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('password is required. ');
          done();
        });
    });
  });
});
