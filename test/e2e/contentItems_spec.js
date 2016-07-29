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


describe('/api/content_items', function() {
  describe('GET', function() {
    var contentItems = [{
      name: 'Some Tip',
      content: 'Here is a tip'
    }, {
      name: 'Another Tip',
      content: 'Here is another tip'
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
        .get('/api/content_items/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          res.body[0].should.have.property('id', 1);
          res.body[0].should.have.property('name', contentItems[0].name);
          res.body[0].should.have.property('content', contentItems[0].content);
          done();
        });
    });

    it('should respond with a 404 if the content item object does not exist', function(done) {
      request(app)
        .get('/api/content_items/3')
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('ContentItem with id 3 not found');
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

    it('should respond with content item id when valid data is submitted', function(done) {
      var json = { name: 'Tip', content: 'Here is a Tip' };

      request(app)
        .post('/api/content_items')
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
        .type('json')
        .send(json)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.be.equal('content is required. ');
          done();
        });
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
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.message.should.equal('ContentItem with id 2 not found');
          done();
        });
    });

  });
});
