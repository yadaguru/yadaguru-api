var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var TestDate = models.TestDate;
var Test = models.Test;


describe('/api/test_dates', function() {

  var tests = [{
    type: 'SAT',
    message: 'A message',
    detail: 'Some details'
  }, {
    type: 'ACT',
    message: 'A message',
    detail: 'Some details'
  }];

  var testDates = [{
    testId: 1,
    registrationDate: '2016-09-01',
    adminDate: '2016-10-01'
  }, {
    testId: 2,
    registrationDate: '2017-01-01',
    adminDate: '2017-02-01'
  }];

  describe('GET', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Test.create(tests[0]).then(function() {
          Test.create(tests[1]).then(function() {
            TestDate.create(testDates[0]).then(function() {
              TestDate.create(testDates[1]).then(function() {
                done();
              })
            })
          })
        })
      })
    });

    it('should respond with all testDates', function(done) {
      request(app)
        .get('/api/test_dates')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('testId', testDates[0].testId);
          res.body[1].should.have.property('registrationDate', testDates[1].registrationDate);
          res.body[0].should.have.property('adminDate', testDates[0].adminDate);
          done();
        });
    });

    it('should respond with requested testDate object', function(done) {
      request(app)
        .get('/api/test_dates/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('testId', testDates[0].testId);
          res.body[0].should.have.property('registrationDate', testDates[0].registrationDate);
          res.body[0].should.have.property('adminDate', testDates[0].adminDate);
          done();
        });
    });

    it('should respond with a 404 if the testDate object does not exist', function(done) {
      request(app)
        .get('/api/test_dates/3')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('TestDate with id 3 not found');
          done();
        })
    })
  });


  describe('POST', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Test.create(tests[0]).then(function() {
          Test.create(tests[1]).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with testDate id when valid data is submitted', function(done) {
      var json = {
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01'
      };

      request(app)
        .post('/api/test_dates')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('testId', 1);
          res.body[0].should.have.property('registrationDate', json.registrationDate);
          res.body[0].should.have.property('adminDate', json.adminDate);
          done();
        });
    });

    it('should respond with error if all required fields is not present', function(done) {
      var json = {
        testId: '1',
        adminDate: '2016-10-01'
      };

      request(app)
        .post('/api/test_dates')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('registrationDate is required. ');
          done();
        });
    });
  });

  describe('PUT', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Test.create(tests[0]).then(function() {
          TestDate.create(testDates[0]).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with the updated testDate on successful update', function(done) {
      var json = {
        registrationDate: '2016-09-02'
      };

      request(app)
        .put('/api/test_dates/1')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('testId', 1);
          res.body[0].should.have.property('registrationDate', '2016-09-02');
          res.body[0].should.have.property('adminDate', '2016-10-01');
          done();
        });
    });

    it('should respond with a 404 if the testDate does not exist', function(done) {
      var json = {
        registrationDate: '2016-09-02'
      };

      request(app)
        .put('/api/test_dates/2')
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('TestDate with id 2 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/test_dates/1')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('testId', 1);
          res.body[0].should.have.property('registrationDate', '2016-09-02');
          res.body[0].should.have.property('adminDate', '2016-10-01');
          done();
        });
    });
  });

  describe('DELETE', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Test.create(tests[0]).then(function() {
          TestDate.create(testDates[0]).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with the deleted testDate id on successful delete', function(done) {
      request(app)
        .delete('/api/test_dates/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should respond with a 404 if the testDate does not exist', function(done) {
      request(app)
        .delete('/api/test_dates/2')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('TestDate with id 2 not found');
          done();
        });
    });

  });
});
