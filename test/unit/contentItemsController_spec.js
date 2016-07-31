/* globals describe, beforeEach, it, afterEach */
var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();
var errors = require('../../services/errorService');
var Promise = require('bluebird');
var contentItemService = require('../../services/contentItemService');

describe('Content Items Controller', function() {
  describe('GET /content_items', function() {
    var req, res, contentItemsController, findAll;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findAll = sinon.stub(contentItemService, 'findAll');
      contentItemsController = require('../../controllers/contentItemsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findAll.restore();
    });

    it('should respond with an array of all content items and a 200 status', function() {
      var contentItems = [{
        id: '1',
        name: 'Help Tip',
        content: 'Here is some help'
      }, {
        id: '2',
        name: 'Another help Tip',
        content: 'Here is another help tip'
      }];
      findAll.returns(Promise.resolve(contentItems));

      return contentItemsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(contentItems);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an empty array and a 200 status if there are no content items', function() {
      findAll.returns(Promise.resolve([]));

      return contentItemsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith([]);
        res.status.should.have.been.calledWith(200);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      var error = new Error('database error');
      findAll.returns(Promise.reject(error));

      return contentItemsController.getAll(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('GET /content_items/:id', function() {
    var req, res, contentItemsController, findById;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      findById = sinon.stub(contentItemService, 'findById');
      contentItemsController = require('../../controllers/contentItemsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      findById.restore();
    });

    it('should respond with an array with the matching content item and a 200 status', function() {
      req.params = {id: 1};
      var contentItem = {
        id: '1',
        name: 'Help Tip',
        content: 'Here is some help'
      };
      findById.withArgs(1)
        .returns(Promise.resolve([contentItem]));

      return contentItemsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith([contentItem]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should an error object and a 404 status if the content item does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('ContentItem', req.params.id);
      findById.withArgs(2)
        .returns(Promise.resolve([]));

      return contentItemsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      });

    });

    it('should respond with an error object and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      findById.returns(Promise.reject(error));

      return contentItemsController.getById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      });

    });
  });

  describe('POST /content_items', function() {
    var req, res, contentItemsController, create;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      create = sinon.stub(contentItemService, 'create');
      contentItemsController = require('../../controllers/contentItemsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      create.restore();
    });

    it('should respond with new contentItem object and 200 status on success', function() {
      req.body = {name: 'Help Tip', content: 'Here is a help tip'};
      var successfulCreateResponse = {
        id: '2',
        name: req.body.name,
        content: req.body.content
      };
      create.returns(Promise.resolve([successfulCreateResponse]));

      return contentItemsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith([successfulCreateResponse]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 400 status on if name is missing', function() {
      req.body = {content: 'Some help text'};
      var error = new errors.ValidationError([{
        field: 'name',
        message: 'is required'
      }]);

      return contentItemsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and 400 status on if content is missing', function() {
      req.body = {name: 'Help Tip'};
      var error = new errors.ValidationError([{
        field: 'content',
        message: 'is required'
      }]);

      return contentItemsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(400);
      });
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Help Tip', content: 'Some Help Text'};
      var databaseError = new Error('some database error');
      create.returns(Promise.reject(databaseError));

      return contentItemsController.post(req, res).then(function() {
        res.json.should.have.been.calledWith(databaseError);
        res.status.should.have.been.calledWith(500);
      });
    });
  });

  describe('PUT /content_items/:id', function() {
    var req, res, contentItemsController, update;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      update = sinon.stub(contentItemService, 'update');
      contentItemsController = require('../../controllers/contentItemsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      update.restore();
    });

    it('should respond with the updated contentItem object and 200 status on success', function() {
      req.body = {name: 'Help Tip', content: 'Some Help Text'};
      req.params = {id: 1};
      var updatedContentItem = {
        id: '1',
        name: req.body.name,
        content: req.body.content
      };
      update.withArgs(req.params.id, req.body)
        .returns(Promise.resolve([updatedContentItem]));

      return contentItemsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith([updatedContentItem]);
        res.status.should.have.been.calledWith(200);
      });
    });

    it('should respond with an error and 404 status if content item does not exist', function() {
      req.body = {name: 'Help Tip', content: 'Some Help Text'};
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('ContentItem', req.params.id);
      update.withArgs(2)
        .returns(Promise.resolve(false));

      return contentItemsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.body = {name: 'Essay'};
      req.params = {id: 1};
      var error = new Error('database error');
      update.withArgs(req.params.id, req.body)
        .returns(Promise.reject(error));

      return contentItemsController.putOnId(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });

  describe('DELETE /content_items/:id', function() {
    var req, res, contentItemsController, destroy;

    beforeEach(function() {
      req = {};
      res = {
        status: sinon.spy(),
        json: sinon.spy()
      };
      destroy = sinon.stub(contentItemService, 'destroy');
      contentItemsController = require('../../controllers/contentItemsController');
    });

    afterEach(function() {
      res.status.reset();
      res.json.reset();
      destroy.restore();
    });

    it('should respond with the content item ID and 200 status on success', function() {
      req.params = {id: 1};
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(true));

      return contentItemsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith([{deletedId: 1}]);
        res.status.should.have.been.calledWith(200);
      })
    });

    it('should respond with an error and 404 status if contentItem does not exist', function() {
      req.params = {id: 2};
      var error = new errors.ResourceNotFoundError('ContentItem', req.params.id);
      destroy.withArgs(req.params.id)
        .returns(Promise.resolve(false));

      return contentItemsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(404);
      })
    });

    it('should respond with an error and a 500 status on a database error', function() {
      req.params = {id: 1};
      var error = new Error('database error');
      destroy.withArgs(req.params.id)
        .returns(Promise.reject(error));

      return contentItemsController.removeById(req, res).then(function() {
        res.json.should.have.been.calledWith(error);
        res.status.should.have.been.calledWith(500);
      })
    });
  });
});
