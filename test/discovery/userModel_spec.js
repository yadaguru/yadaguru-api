var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.should();

var config = require('../../config')[process.env.DEPLOY_MODE];
var models = require('../../models');
var User = models.User;

describe('The User model', function() {

  var phoneNumber = '1234567890';

  describe('create method', function() {
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

  describe('findById method', function() {
    before(function(done) {
      models.sequelize.sync(config.dbSyncOptions).then(function() {
        User.create({phoneNumber: phoneNumber}).then(function() {
          done();
        });
      });
    });

    it('should return the user with id 1', function(done) {
      var user = User.findById(1);
      user.should.eventually.have.deep.property('id', 1).notify(done);
    });

    it('should be null if the id does not exist', function(done) {
      var user = User.findById(2);
      user.should.eventually.be.null.notify(done);
    })
  });

  describe('findAll method', function() {
    before(function(done) {
      models.sequelize.sync(config.dbSyncOptions).then(function() {
        User.create({phoneNumber: '1234567890'}).then(function() {
          User.create({phoneNumber: '9876543210'}).then(function() {
            done();
          });
        });
      });
    });

    it('should return an array of all users', function(done) {
      User.findAll()
        .should.eventually.have.lengthOf(2)
        .notify(done);
    });
  });

  describe('update instance method', function() {
    it('should update the supplied field', function(done) {
      var user = User.findById(1);
      user.then(function(user) {
        user = user.update({confirmCode: '123456'});
        user.should.eventually.have.deep.property('confirmCode', '123456').notify(done);
      })
    });

    it('does not mind extra fields', function(done) {
      var user = User.findById(1);
      user.then(function(user) {
        user = user.update({foo: 'bar', sponsorCode: '123456'});
        user.should.eventually.have.deep.property('sponsorCode', '123456').notify(done);
      })
    });

    it('handles validation errors', function(done) {
      var user = User.findById(1);
      user.then(function(user) {
        user = user.update({phoneNumber: '123456'});
        user.should.be.rejectedWith('Validation error: Validation len failed').notify(done);
      })
    });

    it('returns back unmodified object if empty data', function(done) {
      var user = User.findById(1);
      user.then(function(user) {
        user = user.update({});
        user.should.eventually.have.deep.property('id', 1).notify(done);
      })
    });

    describe('destroy method', function() {
      before(function(done) {
        models.sequelize.sync(config.dbSyncOptions).then(function() {
          User.create({phoneNumber: '1234567890'}).then(function() {
            done();
          });
        });
      });

      it('returns the number of deleted records on destroy', function(done) {
        User.destroy({where: {id: 1}})
          .should.eventually.equal(1)
          .notify(done);
      });

      it('no record', function(done) {
        User.destroy({where: {id: 2}})
          .should.eventually.equal(0)
          .notify(done);
      });
    });

  });

});


