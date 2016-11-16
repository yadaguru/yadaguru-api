var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var TestDate = models.TestDate;
var Test = models.Test;
var testDateService = require('../../services/testDateService');

describe('The TestDates Service', function() {
  var testDates =[{
    id: 1,
    testId: 1,
    registrationDate: '2016-09-01',
    adminDate: '2016-10-01'
  }, {
    id: 2,
    testId: 2,
    registrationDate: '2017-01-01',
    adminDate: '2017-02-01'
  }];

  describe('The findAll function', function() {
    var findAll, dbResponse;

    beforeEach(function() {
      var tests =[{
        id: 1,
        type: 'SAT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: 2,
        type: 'ACT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }];

      dbResponse = [{
        dataValues: {
          id: '1',
          testId: '1',
          registrationDate: '2016-09-01',
          adminDate: '2016-10-01',
          Test: {
            dataValues: tests[0]
          }
        }
      }, {
        dataValues: {
          id: '2',
          testId: '1',
          registrationDate: '2016-09-15',
          adminDate: '2016-10-15',
          Test: {
            dataValues: tests[0]
          }
        }
      }, {
        dataValues: {
          id: '3',
          testId: '2',
          registrationDate: '2017-01-01',
          adminDate: '2016-02-01',
          Test: {
            dataValues: tests[1]
          }
        }
      }, {
        dataValues: {
          id: '4',
          testId: '2',
          registrationDate: '2017-01-15',
          adminDate: '2016-02-15',
          Test: {
            dataValues: tests[1]
          }
        }
      }];

      findAll = sinon.stub(TestDate, 'findAll');
    });

    afterEach(function() {
      findAll.restore();
    });

    it('should return all testDates including its associated test data', function() {
      findAll.withArgs({
        include: Test
      }).returns(Promise.resolve(dbResponse));

      var returnedResult = [{
        id: '1',
        testId: '1',
        registrationDate: '2016-09-01',
        adminDate: '2016-10-01',
        type: 'SAT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: '2',
        testId: '1',
        registrationDate: '2016-09-15',
        adminDate: '2016-10-15',
        type: 'SAT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: '3',
        testId: '2',
        registrationDate: '2017-01-01',
        adminDate: '2016-02-01',
        type: 'ACT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }, {
        id: '4',
        testId: '2',
        registrationDate: '2017-01-15',
        adminDate: '2016-02-15',
        type: 'ACT',
        registrationMessage: 'A message about registering',
        registrationDetail: 'Some details',
        adminMessage: 'A message about the test',
        adminDetail: 'Some details'
      }];

      return testDateService.findAll().should.eventually.deep.equal(returnedResult);
    });

    it('should resolve with an empty array there are no testDates', function() {
      findAll.withArgs({include: Test})
        .returns(Promise.resolve([]));

      return testDateService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findById;

    before(function() {
      findById = sinon.stub(TestDate, 'findById');
    });

    after(function() {
      findById.restore();
    });

    it('should resolve with an array with the matching testDate object', function() {
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: testDates[0]}));

      return testDateService.findById(1).should.eventually.deep.equal([testDates[0]]);
    });

    it('should resolve with an empty array if no testDates were found', function() {
      findById.withArgs(3)
        .returns(Promise.resolve(null));

      return testDateService.findById(3).should.eventually.deep.equal([]);
    });
  });


  describe('The create function', function() {
    var create;

    var newTestDate = {
      testId: 1,
      registrationDate: '2016-09-01',
      adminDate: '2016-10-01'
    };

    before(function() {
      create = sinon.stub(TestDate, 'create');
    });

    after(function() {
      create.restore();
    });

    it('should resolve with an array containing the new testDate object', function() {
      create.withArgs(newTestDate)
        .returns(Promise.resolve({dataValues: newTestDate}));

      return testDateService.create(newTestDate).should.eventually.deep.equal([newTestDate]);
    });
  });

  describe('The update function', function() {
    var findById, row, update, idToUpdate;

    var updatedTestDate = {
      testId: 1,
      registrationDate: '2016-09-01',
      adminDate: '2016-10-01'
    };

    idToUpdate = 1;

    before(function() {
      findById = sinon.stub(TestDate, 'findById');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findById.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated testDate object', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(row));
      update.withArgs(updatedTestDate)
        .returns(Promise.resolve({dataValues: updatedTestDate}));

      return testDateService.update(idToUpdate, updatedTestDate).should.eventually.deep.equal([updatedTestDate]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(null));

      return testDateService.update(idToUpdate, updatedTestDate).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var row, destroy, findById;

    var idToDestroy = 1;

    before(function() {
      findById = sinon.stub(TestDate, 'findById');
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

      return testDateService.destroy(idToDestroy).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(null));

      return testDateService.destroy(idToDestroy).should.eventually.be.false;
    });
  });
});
