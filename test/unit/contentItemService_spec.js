var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var ContentItem = models.ContentItem;
var contentItemService = require('../../services/contentItemService');

describe('The ContentItems Service', function() {
  var contentItems =[{
    id: 1,
    name: 'faqs',
    content: 'Some frequently asked questions...'
  }, {
    id: 2,
    name: 'privacy',
    content: 'Our privacy policy...'
  }];

  describe('The findAll function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(ContentItem, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing contentItems', function() {
      findAll.returns(Promise.resolve(contentItems.map(
        function(contentItem) {
          return {dataValues: contentItem};
        }
      )));

      return contentItemService.findAll().should.eventually.deep.equal(contentItems);
    });

    it('should resolve with an empty array there are no contentItems', function() {
      findAll.returns(Promise.resolve([]));

      return contentItemService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(ContentItem, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array with the matching contentItem object', function() {
      findAll.withArgs({where: {name: 'faqs'}})
        .returns(Promise.resolve([{dataValues: contentItems[0]}]));

      return contentItemService.findByName('faqs').should.eventually.deep.equal([contentItems[0]]);
    });

    it('should resolve with an empty array if no contentItems were found', function() {
      findAll.withArgs({where: {name: 'foobar'}})
        .returns(Promise.resolve([]));

      return contentItemService.findByName('foobar').should.eventually.deep.equal([]);
    });
  });

  describe('The create function', function() {
    var create;

    var newContentItem = {
      name: 'A tip',
      content: 'Some details'
    };

    before(function() {
      create = sinon.stub(ContentItem, 'create');
    });

    after(function() {
      create.restore();
    });

    it('should resolve with an array containing the new contentItem object', function() {
      create.withArgs(newContentItem)
        .returns(Promise.resolve({dataValues: newContentItem}));

      return contentItemService.create(newContentItem).should.eventually.deep.equal([newContentItem]);
    });
  });

  describe('The update function', function() {
    var findById, row, update, idToUpdate;

    var updatedContentItem = {
      name: 'A tip',
      content: 'Some details'
    };

    idToUpdate = 1;

    before(function() {
      findById = sinon.stub(ContentItem, 'findById');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findById.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated contentItem object', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(row));
      update.withArgs(updatedContentItem)
        .returns(Promise.resolve({dataValues: updatedContentItem}));

      return contentItemService.update(idToUpdate, updatedContentItem).should.eventually.deep.equal([updatedContentItem]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(null));

      return contentItemService.update(idToUpdate, updatedContentItem).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var row, destroy, findById;

    var idToDestroy = 1;

    before(function() {
      findById = sinon.stub(ContentItem, 'findById');
      row = {destroy: function(){}};
      destroy = sinon.stub(row, 'destroy');
    });

    after(function() {
      findById.restore();
      destroy.restore();
    });

    it('should resolve with true when the row is destroyed', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(row));
      destroy.withArgs()
        .returns(Promise.resolve(undefined));

      return contentItemService.destroy(idToDestroy).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(null));

      return contentItemService.destroy(idToDestroy).should.eventually.be.false;
    });
  });
});
