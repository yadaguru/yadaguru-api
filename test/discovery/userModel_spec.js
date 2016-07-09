var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

var config = require('../../config')[process.env.DEPLOY_MODE];
var models = require('../../models');
var User = models.User;

describe('The User model', function() {

  var phoneNumber = '1234567890';

  before(function(done) {
    models.sequelize.sync(config.dbSyncOptions).then(function() {
      done();
    });
  });

  it('should create a new user given a phone number and return the new user', function(done) {
    User.create({phoneNumber: phoneNumber}).should.eventually.have.deep.property(
      'dataValues.phoneNumber', phoneNumber).notify(done);
  });

  it('should fail if not a phone number', function(done) {
    User.create({phoneNumber: 'abcdefghij'}).should.be.rejectedWith(
      'Validation error: Validation isNumeric failed').notify(done);
  });

  it('should fail if no phone number is provided', function(done) {
    User.create({}).should.be.rejectedWith(
      'notNull Violation: phoneNumber cannot be null').notify(done);
  });

  it('should fail if phone number is less than 10 digits', function(done) {
    User.create({phoneNumber: '123456789'}).should.be.rejectedWith(
      'Validation error: Validation len failed').notify(done);
  });

  it('should fail if phone number is more than 10 digits', function(done) {
    User.create({phoneNumber: '12345678910'}).should.be.rejectedWith(
      'Validation error: Validation len failed').notify(done);
  });

  it('should fail if phone number is already in the system', function(done) {
    var newUser = User.create({phoneNumber: phoneNumber});
    newUser.catch(function(error){console.log(error);});
    newUser.should.be.rejectedWith('Validation error').notify(done);
  });


});


