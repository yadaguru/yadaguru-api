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

var usersService = require('../../services/usersService');
var User = require('../../models').User;

describe('Users Service', function() {

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
    newUser.should.eventually.deep.equal(newUserObject).notify(done);
  });

  it('should accept phone numbers with formatting', function(done) {
    var formattedNumber = '123-456-7890';
    var validPhoneNumber = '1234567890';
    var newUserObject = makeNewUserObject(validPhoneNumber);
    stub.withArgs({phoneNumber: formattedNumber})
      .returns(Promise.resolve({dataValues: newUserObject}));

    var newUser = usersService.create({phoneNumber: formattedNumber});
    newUser.should.eventually.deep.equal(newUserObject).notify(done);
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
