var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var School = models.School;
var schoolService = require('../../services/schoolService');

describe('The Schools Service', function() {
  var schools =[{
    id: '1',
    userId: '1',
    name: 'Temple',
    dueDate: '2017-02-01',
    isActive: true
  }, {
    id: '2',
    userId: '1',
    name: 'Drexel',
    dueDate: '2017-02-01',
    isActive: true
  }];

  describe('The findByUser function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(School, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing schools', function() {
      findAll.returns(Promise.resolve(schools.map(
        function(school) {
          return {dataValues: school};
        }
      )));

      return schoolService.findByUser(1).should.eventually.deep.equal(schools);
    });

    it('should resolve with an empty array there are no schools', function() {
      findAll.returns(Promise.resolve([]));

      return schoolService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findById;

    before(function() {
      findById = sinon.stub(School, 'findById');
    });

    after(function() {
      findById.restore();
    });

    it('should resolve with an array with the matching school object', function() {
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: schools[0]}));

      return schoolService.findById(1).should.eventually.deep.equal([schools[0]]);
    });

    it('should resolve with an empty array if no schools were found', function() {
      findById.withArgs(3)
        .returns(Promise.resolve(null));

      return schoolService.findById(3).should.eventually.deep.equal([]);
    });
  });

  describe('The create function', function() {
    var create;

    var newSchool = {
      userId: '1',
      name: 'Temple',
      dueDate: '2017-02-01',
      isActive: true
    };

    before(function() {
      create = sinon.stub(School, 'create');
    });

    after(function() {
      create.restore();
    });

    it('should resolve with an array containing the new school object', function() {
      create.withArgs(newSchool)
        .returns(Promise.resolve({dataValues: newSchool}));

      return schoolService.create(newSchool).should.eventually.deep.equal([newSchool]);
    });
  });

  describe('The update function', function() {
    var findById, row, update, idToUpdate;

    var updatedSchool = {
        userId: 1,
        name: 'Drexel',
        dueDate: '2017-02-01',
        isActive: true
    };

    idToUpdate = 1;

    before(function() {
      findById = sinon.stub(School, 'findById');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findById.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated school object', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(row));
      update.withArgs(updatedSchool)
        .returns(Promise.resolve({dataValues: updatedSchool}));

      return schoolService.update(idToUpdate, updatedSchool).should.eventually.deep.equal([updatedSchool]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(null));

      return schoolService.update(idToUpdate, updatedSchool).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var row, destroy, findById;

    var idToDestroy = 1;

    before(function() {
      findById = sinon.stub(School, 'findById');
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

      return schoolService.destroy(idToDestroy).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(null));

      return schoolService.destroy(idToDestroy).should.eventually.be.false;
    });
  });
});
