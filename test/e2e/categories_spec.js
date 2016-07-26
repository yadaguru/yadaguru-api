var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var Category = models.Category;


describe('/api/categories', function() {
  describe('GET', function() {
    var categories = [{
      name: 'Essays'
    }, {
      name: 'Recommendations'
    }];

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Category.create(categories[0]).then(function() {
          Category.create(categories[1]).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with all categories', function(done) {
      request(app)
        .get('/api/categories')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('name', 'Essays');
          res.body[1].should.have.property('name', 'Recommendations');
          done();
        });
    });

    it('should respond with requested category object', function(done) {
      request(app)
        .get('/api/categories/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', categories[0].name);
          done();
        });
    });

    it('should respond with a 404 if the category object does not exist', function(done) {
      request(app)
        .get('/api/categories/3')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Category with id 3 not found');
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

    it('should respond with category id when phone number is valid', function(done) {
      var json = { name: 'Essays' };

      request(app)
        .post('/api/categories')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name', 'Essays');
          done();
        });
    });

    it('should respond with error if name field is not present', function(done) {
      var json = { foo: 'bar' };

      request(app)
        .post('/api/categories')
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('name is required. ');
          done();
        });
    });
  });

  describe('PUT', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Category.create({name: 'Essays'}).then(function() {
          done();
        })
      });
    });

    it('should respond with the updated category on successful update', function(done) {
      var json = { name: 'Recommendations' };

      request(app)
        .put('/api/categories/1')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'Recommendations');
          done();
        });
    });

    it('should respond with a 404 if the category does not exist', function(done) {
      var json = { name: 'Recommendations' };

      request(app)
        .put('/api/categories/2')
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('Category with id 2 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/categories/1')
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'Recommendations');
          done();
        });
    });
  });

  describe('DELETE', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        Category.create({name: 'Essays'}).then(function() {
          done();
        })
      });
    });

    it('should respond with the deleted category id on successful delete', function(done) {
      request(app)
        .delete('/api/categories/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should respond with a 404 if the category does not exist', function(done) {
      request(app)
        .delete('/api/categories/2')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Category with id 2 not found');
          done();
        });
    });

  });
});
