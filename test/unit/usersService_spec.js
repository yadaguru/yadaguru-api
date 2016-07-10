var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();
var Promise = require('bluebird');
var ApiError = require('../../services/errorService').ApiError;
var Sequelize = require('sequelize');
var SequelizeUniqueConstraintError = Sequelize.UniqueConstraintError;
var SequelizeValidationError = Sequelize.ValidationError;

var usersService = require('../../services/usersService');
var User = require('../../models').User;

describe('Users Service', function() {

  describe('findAll method', function() {
    var findAll;

    var users = [{
      dataValues: {
        id: '1',
        phoneNumber: '1234567890',
        confirmCode: '123456',
        confirmCodeExpires: '',
        sponsorCode: ''
      }
    }, {
      dataValues: {
        id: '2',
        phoneNumber: '9876543210',
        confirmCode: '654321',
        confirmCodeExpires: '',
        sponsorCode: ''
      }
    }];

    before(function() {
      findAll = sinon.stub(User, 'findAll');
    });

    after(function() {
      findAll.restore();
    });

    it ('should return an array of all users', function(done) {
      findAll.withArgs()
        .returns(Promise.resolve(users));
      usersService.findAll().should.eventually.have.lengthOf(2)
        .notify(done);
    });

  });

  describe('findById method', function() {
    var findById;

    var user = {
      id: '1',
      phoneNumber: '1234567890',
      confirmCode: '123456',
      confirmCodeExpires: '',
      sponsorCode: ''
    };

    before(function() {
      findById = sinon.stub(User, 'findById');
    });

    after(function() {
      findById.restore();
    });

    it('return object associated with supplied user id', function(done) {
      findById.withArgs(1)
        .returns(Promise.resolve({dataValues: user}));

      usersService.findById(1).should.eventually.deep.equal([user]).notify(done);
    });

    it('should fail if there is no user id supplied', function(done) {
      usersService.findById().should.be.rejectedWith(ApiError, 'No user id specified').notify(done);
    });

    it('should fail if user does not exist', function(done) {
      findById.withArgs(2)
        .returns(Promise.resolve(null));

      usersService.findById(2).should.be.rejectedWith(ApiError, 'User not found').notify(done);
    });

  });
  describe('Create method', function() {
    var stub;

    var makeNewUserObject = function(phoneNumber) {
      return {
        id: '1',
        phoneNumber: phoneNumber,
        confirmCode: '',
        confirmCodeExpires: '',
        sponsorCode: ''
      }
    };

    before(function() {
      stub = sinon.stub(User, 'create');
    });

    after(function() {
      stub.restore();
    });

    it('should return userId if phone_number is valid', function(done) {
      var validPhoneNumber = '1234567890';
      var newUserObject = makeNewUserObject(validPhoneNumber);
      stub.withArgs({phoneNumber: validPhoneNumber})
        .returns(Promise.resolve({dataValues: newUserObject}));

      var newUser = usersService.create({phoneNumber: validPhoneNumber});
      newUser.should.eventually.deep.equal([newUserObject]).notify(done);
    });

    it('should accept phone numbers with formatting', function(done) {
      var formattedNumber = '123-456-7890';
      var validPhoneNumber = '1234567890';
      var newUserObject = makeNewUserObject(validPhoneNumber);
      stub.withArgs({phoneNumber: formattedNumber})
        .returns(Promise.resolve({dataValues: newUserObject}));

      var newUser = usersService.create({phoneNumber: formattedNumber});
      newUser.should.eventually.deep.equal([newUserObject]).notify(done);
    });

    it('should return an error if phone number is invalid', function(done) {
      var invalidNumber = 'abcdefghijk';

      var newUser = usersService.create({phoneNumber: invalidNumber});
      newUser.should.be.rejectedWith(ApiError, 'Invalid Phone Number: Must be 10 digits').notify(done);
    });

    it('should return an error if phone number already exists', function(done) {
      var existingNumber = '1234567890';
      stub.withArgs({phoneNumber: existingNumber})
        .returns(Promise.reject(new SequelizeUniqueConstraintError({
          errors: [{
            message: 'phoneNumber must be unique'
          }]
        })));

      var newUser = usersService.create({phoneNumber: existingNumber});
      newUser.should.be.rejectedWith(ApiError, 'Resource already exists').notify(done);
    });

    it('should return an error if phone number is not supplied', function(done) {
      var newUser = usersService.create({foo: 'bar'});
      newUser.should.be.rejectedWith(ApiError, 'Missing Fields: phoneNumber').notify(done);
    });

    it('should return an error if no data is supplied', function (done) {
      var newUser = usersService.create();
      newUser.should.be.rejectedWith(ApiError, 'No data supplied').notify(done);
    });
  });

  describe('Update method', function() {
    var findById, update, user;

    var updatedUser = {
      id: '1',
      phoneNumber: '1234567890',
      confirmCode: '123456',
      confirmCodeExpires: '',
      sponsorCode: ''
    };

    before(function() {
      findById = sinon.stub(User, 'findById');
      user = {update: function(values) {}};
      update = sinon.stub(user, 'update');
    });

    after(function() {
      findById.restore();
    });

    it('should update a field and return the updated object', function(done) {
      var updateData = {
        confirmCode: '123456'
      };

      findById.withArgs(1)
        .returns(Promise.resolve(user));
      update.withArgs(updateData)
        .returns(Promise.resolve({dataValues: updatedUser}));

      usersService.update(1, updateData).should.eventually.deep.equal([updatedUser]).notify(done);
    });

    it('should not complain if there are extra fields', function(done) {
      var updateData = {
        confirmCode: '123456',
        foo: 'bar'
      };

      findById.withArgs(1)
        .returns(Promise.resolve(user));
      update.withArgs(updateData)
        .returns(Promise.resolve({dataValues: updatedUser}));

      usersService.update(1, updateData).should.eventually.deep.equal([updatedUser]).notify(done);
    });

    it('should handle validation errors', function(done) {
      var updateData = {
        confirmCode: '123'
      };

      findById.withArgs(1)
        .returns(Promise.resolve(user));
      update.withArgs(updateData)
        .returns(Promise.reject(new SequelizeValidationError('Validation error: Validation len failed')));

      usersService.update(1, updateData).should.be.rejectedWith(ApiError, 'SequelizeValidationError').notify(done);
    });

    it('should fail if there is no data supplied', function(done) {
      usersService.update(1).should.be.rejectedWith(ApiError, 'No data supplied').notify(done);
    });

    it('should return back the unmodified object if empty object is supplied', function(done) {
      findById.withArgs(1)
        .returns(Promise.resolve(user));
      update.withArgs({})
        .returns(Promise.resolve({dataValues: updatedUser}));

      usersService.update(1, {}).should.eventually.deep.equal([updatedUser]).notify(done);
    });

    it('should fail if there is no user id supplied', function(done) {
      var updateData = {
        confirmCode: '123456'
      };

      usersService.update(null, updateData).should.be.rejectedWith(ApiError, 'No user id specified').notify(done);
    });

    it('should fail if user does not exist', function(done) {
      var updateData = {
        confirmCode: '123456'
      };

      findById.withArgs(2)
        .returns(Promise.resolve(null));

      usersService.update(2, updateData).should.be.rejectedWith(ApiError, 'User not found').notify(done);
    });

  });

});
