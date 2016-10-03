var env       = process.env.NODE_ENV || 'development';
if (env !== 'test') {
  throw new Error('E2E tests should be with NODE_ENV=test in order to prevent data loss to the development database');
}

var request = require('supertest');
var chai = require('chai');
chai.should();
var app = require('../../app.js');
var models = require('../../models');
var ContentItem = models.ContentItem;
var jwt = require('jsonwebtoken');
var tokenAdmin = jwt.sign({userId: 1, role: 'admin'}, 'development_secret', {noTimestamp: true});
var tokenUser = jwt.sign({userId: 1, role: 'user'}, 'development_secret', {noTimestamp: true});

describe('/api/content_items', function() {
  describe('GET', function() {
    var contentItems = [{
      id: 1,
      name: 'faqs',
      content: 'Some frequently asked questions...'
    }, {
      id: 2,
      name: 'privacy',
      content: 'Our privacy policy...'
    }];

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        ContentItem.create(contentItems[0]).then(function() {
          ContentItem.create(contentItems[1]).then(function() {
            done();
          })
        })
      })
    });

    it('should respond with all contentItems', function(done) {
      request(app)
        .get('/api/content_items')
        .set('Bearer', tokenAdmin)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.lengthOf(2);
          res.body[0].should.have.property('name', contentItems[0].name);
          res.body[1].should.have.property('content', contentItems[1].content);
          done();
        });
    });

    it('should respond with requested content item object', function(done) {
      request(app)
        .get('/api/content_items/faqs')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          console.log(res.body);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', contentItems[0].name);
          res.body[0].should.have.property('content', contentItems[0].content);
          done();
        });
    });

    it('should respond with a 404 if the content item object does not exist', function(done) {
      request(app)
        .get('/api/content_items/foobar')
        .set('Bearer', tokenAdmin)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('ContentItem with id foobar not found');
          done();
        })
    });
  });


  describe('POST', function() {

    before(function(done) {
      models.sequelize.sync({force: true}).then(function() {
        done();
      });
    });

    it('should respond with content item id when valid data is submitted', function(done) {
      var json = { name: 'Tip', content: 'Here is a Tip' };

      request(app)
        .post('/api/content_items')
        .set('Bearer', tokenAdmin)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id');
          res.body[0].should.have.property('name', json.name);
          res.body[0].should.have.property('content', json.content);
          done();
        });
    });

    it('should respond with error if all required fields is not present', function(done) {
      var json = { name: 'forgot one' };

      request(app)
        .post('/api/content_items')
        .set('Bearer', tokenAdmin)
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('content is required. ');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .post('/api/content_items')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .post('/api/content_items')
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
        .post('/api/content_items')
        .set('Bearer', tokenUser)
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
        ContentItem.create({name: 'A Tip', content: 'Here is a Tip'}).then(function() {
          done();
        })
      });
    });

    it('should respond with the updated content item on successful update', function(done) {
      var json = { content: 'Here is an edited tip' };

      request(app)
        .put('/api/content_items/1')
        .set('Bearer', tokenAdmin)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'A Tip');
          res.body[0].should.have.property('content', 'Here is an edited tip');
          done();
        });
    });

    it('should respond with a 404 if the content item does not exist', function(done) {
      var json = { name: 'Tip', content: 'Here is a Tip' };

      request(app)
        .put('/api/content_items/2')
        .set('Bearer', tokenAdmin)
        .type('json')
        .send(json)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('ContentItem with id 2 not found');
          done();
        });
    });

    it('should respond with unmodified object if no data is passed', function(done) {
      var json = {};

      request(app)
        .put('/api/content_items/1')
        .set('Bearer', tokenAdmin)
        .type('json')
        .send(json)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', 'A Tip');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .put('/api/content_items/1')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .put('/api/content_items/1')
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
        .put('/api/content_items/1')
        .set('Bearer', tokenUser)
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
        ContentItem.create({name: 'A Tip', content: 'Here is a tip'}).then(function() {
          done();
        })
      });
    });

    it('should respond with the deleted content item id on successful delete', function(done) {
      request(app)
        .delete('/api/content_items/1')
        .set('Bearer', tokenAdmin)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.deep.equal([{deletedId: '1'}]);
          done();
        });
    });

    it('should respond with a 404 if the content item does not exist', function(done) {
      request(app)
        .delete('/api/content_items/2')
        .set('Bearer', tokenAdmin)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('ContentItem with id 2 not found');
          done();
        });
    });

    it('should respond with a 401 if there is no user token header', function(done) {
      request(app)
        .delete('/api/content_items/2')
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });

    it('should respond with a 401 if the token is invalid', function(done) {
      request(app)
        .delete('/api/content_items/2')
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
        .delete('/api/content_items/2')
        .set('Bearer', tokenUser)
        .expect(401)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('Not Authorized: You do not have permission to access this resource');
          done();
        })
    });
  });
});
