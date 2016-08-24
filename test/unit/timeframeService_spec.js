var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var Timeframe = models.Timeframe;
var timeframeService = require('../../services/timeframeService');

describe('The Timeframes Service', function() {
  var timeframes =[{
    id: 1,
    name: 'Today',
    type: 'now',
    formula: undefined
  }, {
    id: 2,
    name: 'In 30 Days',
    type: 'relative',
    formula: '30'
  }, {
    id: 3,
    name: 'January 1',
    type: 'absolute',
    formula: '2017-01-01'
  }];

  describe('The findAll function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(Timeframe, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing timeframes', function() {
      findAll.returns(Promise.resolve(timeframes.map(
        function(timeframe) {
          return {dataValues: timeframe};
        }
      )));

      return timeframeService.findAll().should.eventually.deep.equal(timeframes);
    });

    it('should resolve with an empty array there are no timeframes', function() {
      findAll.returns(Promise.resolve([]));

      return timeframeService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findById;

    before(function() {
      findById = sinon.stub(Timeframe, 'findById');
    });

    after(function() {
      findById.restore();
    });

    it('should resolve with an array with the matching timeframe object', function() {
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: timeframes[0]}));

      return timeframeService.findById(1).should.eventually.deep.equal([timeframes[0]]);
    });

    it('should resolve with an empty array if no timeframes were found', function() {
      findById.withArgs(3)
        .returns(Promise.resolve(null));

      return timeframeService.findById(3).should.eventually.deep.equal([]);
    });
  });

  describe('The create function', function() {
    var create;

    var newTimeframe = {
      name: 'Today',
      type: 'now',
      formula: undefined
    };

    before(function() {
      create = sinon.stub(Timeframe, 'create');
    });

    after(function() {
      create.restore();
    });

    it('should resolve with an array containing the new timeframe object', function() {
      create.withArgs(newTimeframe)
        .returns(Promise.resolve({dataValues: newTimeframe}));

      return timeframeService.create(newTimeframe).should.eventually.deep.equal([newTimeframe]);
    });
  });

  describe('The update function', function() {
    var findById, row, update, idToUpdate;

    var updatedTimeframe = {
      name: 'Today',
      type: 'now',
      formula: undefined
    };

    idToUpdate = 1;

    before(function() {
      findById = sinon.stub(Timeframe, 'findById');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findById.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated timeframe object', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(row));
      update.withArgs(updatedTimeframe)
        .returns(Promise.resolve({dataValues: updatedTimeframe}));

      return timeframeService.update(idToUpdate, updatedTimeframe).should.eventually.deep.equal([updatedTimeframe]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(null));

      return timeframeService.update(idToUpdate, updatedTimeframe).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var row, destroy, findById;

    var idToDestroy = 1;

    before(function() {
      findById = sinon.stub(Timeframe, 'findById');
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

      return timeframeService.destroy(idToDestroy).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(null));

      return timeframeService.destroy(idToDestroy).should.eventually.be.false;
    });
  });
});
