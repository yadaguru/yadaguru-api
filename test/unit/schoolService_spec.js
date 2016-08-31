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

  describe('The findByIdForUser function', function() {
    var findOne;

    before(function() {
      findOne = sinon.stub(School, 'findOne');
    });

    after(function() {
      findOne.restore();
    });

    it('should resolve with an array with the matching school object', function() {
      findOne.withArgs({where: {id: 1, userId: 1}})
        .returns(Promise.resolve({dataValues: schools[0]}));

      return schoolService.findByIdForUser(1, 1).should.eventually.deep.equal([schools[0]]);
    });

    it('should resolve with an empty array if no schools were found', function() {
      findOne.withArgs({where: {id: 2, userId: 1}})
        .returns(Promise.resolve(null));

      return schoolService.findByIdForUser(2, 1).should.eventually.deep.equal([]);
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

  describe('The updateForUser function', function() {
    var findOne, row, update, idToUpdate;

    var updatedSchool = {
        userId: 1,
        name: 'Drexel',
        dueDate: '2017-02-01',
        isActive: true
    };

    idToUpdate = 1;

    before(function() {
      findOne = sinon.stub(School, 'findOne');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findOne.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated school object', function() {
      findOne.withArgs({where: {id: 1, userId: 1}})
        .returns(Promise.resolve(row));
      update.withArgs(updatedSchool)
        .returns(Promise.resolve({dataValues: updatedSchool}));

      return schoolService.updateForUser(idToUpdate, updatedSchool, 1)
        .should.eventually.deep.equal([updatedSchool]);
    });

    it('should resolve with false if the id does not exist', function() {
      findOne.withArgs({where: {id: 2, userId: 1}})
        .returns(Promise.resolve(null));

      return schoolService.updateForUser(2, updatedSchool, 1).should.eventually.be.false;
    });
  });

  describe('The destroyForUser function', function() {
    var row, destroy, findOne;

    before(function() {
      findOne = sinon.stub(School, 'findOne');
      row = {destroy: function(){}};
      destroy = sinon.stub(row, 'destroy');
    });

    after(function() {
      findOne.restore();
      destroy.restore();
    });

    it('should resolve with true when the row is destroyed', function() {
      findOne.withArgs({where: {id: 1, userId: 1}})
        .returns(Promise.resolve(row));
      destroy.withArgs()
        .returns(Promise.resolve(undefined));

      return schoolService.destroyForUser(1, 1).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findOne.withArgs({where: {id: 2, userId: 1}})
        .returns(Promise.resolve(null));

      return schoolService.destroyForUser(2, 1).should.eventually.be.false;
    });
  });
});
