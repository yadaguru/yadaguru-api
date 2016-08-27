var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var User = models.User;
var userService = require('../../services/userService');

describe('The Users Service', function() {
  var users = [{
    id: 1,
    phoneNumber: '1234567890',
    confirmCode: '123456',
    confirmCodeTimestamp: '',
    sponsorCode: '123456'
  }, {
    id: 2,
    phoneNumber: '9876543210',
    confirmCodeTimestamp: '',
    sponsorCode: '654321'
  }];

  describe('The findAll function', function() {
    var findAll;

    before(function() {
      findAll = sinon.stub(User, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it('should resolve with an array of objects representing users', function() {
      findAll.returns(Promise.resolve(users.map(
        function(user) {
          return {dataValues: user};
        }
      )));

      return userService.findAll().should.eventually.deep.equal(users);
    });

    it('should resolve with an empty array there are no users', function() {
      findAll.returns(Promise.resolve([]));

      return userService.findAll().should.eventually.deep.equal([]);
    });
  });

  describe('The findById function', function() {
    var findById;

    before(function() {
      findById = sinon.stub(User, 'findById');
    });

    after(function() {
      findById.restore();
    });

    it('should resolve with an array with the matching user object', function() {
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: users[0]}));

      return userService.findById(1).should.eventually.deep.equal([users[0]]);
    });

    it('should resolve with an empty array if no users were found', function() {
      findById.withArgs(3)
        .returns(Promise.resolve(null));

      return userService.findById(3).should.eventually.deep.equal([]);
    });
  });

  describe('The getUserByPhoneNumber function', function() {
    var findOne;

    before(function() {
      findOne = sinon.stub(User, 'findOne');
    });

    after(function() {
      findOne.restore();
    });

    it('should resolve with  the matching user object', function() {
      var userObj = {dataValues: users[0]};
      findOne.withArgs({where: {phoneNumber: '1234567890'}})
        .returns(Promise.resolve(userObj));

      return userService.getUserByPhoneNumber('1234567890').should.eventually.deep.equal(userObj);
    });

    it('should resolve with null if no matching users were found', function() {
      findOne.withArgs({where: {phoneNumber: '5555555555'}})
        .returns(Promise.resolve(null));

      return userService.getUserByPhoneNumber('5555555555').should.eventually.deep.equal(null);
    });
  });

  describe('The create function', function() {
    var create;

    var newUser = {
      phoneNumber: '1234567890'
    };

    before(function() {
      create = sinon.stub(User, 'create');
    });

    after(function() {
      create.restore();
    });

    it('should resolve with an array containing the new user object', function() {
      create.withArgs(newUser)
        .returns(Promise.resolve({dataValues: newUser}));

      return userService.create(newUser).should.eventually.deep.equal([newUser]);
    });
  });

  describe('The update function', function() {
    var findById, row, update, idToUpdate;

    var updatedUser = {
      phoneNumber: '1234567890'
    };

    idToUpdate = 1;

    before(function() {
      findById = sinon.stub(User, 'findById');
      row = {update: function(){}};
      update = sinon.stub(row, 'update');
    });

    after(function() {
      findById.restore();
      update.restore();
    });

    it('should resolve with an array containing the updated user object', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(row));
      update.withArgs(updatedUser)
        .returns(Promise.resolve({dataValues: updatedUser}));

      return userService.update(idToUpdate, updatedUser).should.eventually.deep.equal([updatedUser]);
    });

    it('should resolve with false if the id does not exist', function() {
      findById.withArgs(idToUpdate)
        .returns(Promise.resolve(null));

      return userService.update(idToUpdate, updatedUser).should.eventually.be.false;
    });
  });

  describe('The destroy function', function() {
    var row, destroy, findById;

    var idToDestroy = 1;

    before(function() {
      findById = sinon.stub(User, 'findById');
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

      return userService.destroy(idToDestroy).should.eventually.be.true;
    });

    it('should resolve with false id does not exist', function() {
      findById.withArgs(idToDestroy)
        .returns(Promise.resolve(null));

      return userService.destroy(idToDestroy).should.eventually.be.false;
    });
  });
});
