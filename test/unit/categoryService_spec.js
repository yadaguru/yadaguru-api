var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var Category = models.Category;
var categoryService = require('../../services/categoryService');

describe('The Categories Service', function() {
  var categories = [
    {name: 'Essays'},
    {name: 'Tests'}
  ];

  describe('The findAll function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(Category, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing categories', function() {
      findAll.returns(Promise.resolve(categories.map(
        function(category) {
          return {dataValues: category};
        }
      )));

      return categoryService.findAll().should.eventually.deep.equal(categories);
    });

    it('should resolve with an empty array there are no categories', function() {
      findAll.returns(Promise.resolve([]));

      return categoryService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findById;

    before(function() {
      findById = sinon.stub(Category, 'findById');
    });

    after(function() {
      findById.restore();
    });

    it('should resolve with an array with the matching category object', function() {
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: categories[0]}));

      return categoryService.findById(1).should.eventually.deep.equal([categories[0]]);
    });

    it('should resolve with an empty array if no categories were found', function() {
      findById.withArgs(3)
        .returns(Promise.resolve(null));

      return categoryService.findById(3).should.eventually.deep.equal([]);
    });
  });

  describe('The create function', function() {
    var create;

    var newCategory = {
      name: 'Essays'
    };

    before(function() {
      create = sinon.stub(Category, 'create');
    });

    after(function() {
      create.restore();
    });

    it('should resolve with an array containing the new category object', function() {
      create.withArgs(newCategory)
        .returns(Promise.resolve({dataValues: newCategory}));

      return categoryService.create(newCategory).should.eventually.deep.equal([newCategory]);
    });
  });

  describe('The update function', function() {
    var findById, row, update, idToUpdate;

    var updatedCategory = {
      name: 'Essays'
    };

    idToUpdate = 1;

    before(function() {
      findById = sinon.stub(Category, 'findById');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findById.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated category object', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(row));
      update.withArgs(updatedCategory)
        .returns(Promise.resolve({dataValues: updatedCategory}));

      return categoryService.update(idToUpdate, updatedCategory).should.eventually.deep.equal([updatedCategory]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(null));

      return categoryService.update(idToUpdate, updatedCategory).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var row, destroy, findById;

    var idToDestroy = 1;

    before(function() {
      findById = sinon.stub(Category, 'findById');
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

      return categoryService.destroy(idToDestroy).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(null));

      return categoryService.destroy(idToDestroy).should.eventually.be.false;
    });
  });
});
