var sinon = require('sinon');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.should();

var models = require('../../models');
var AdminUser = models.AdminUser;
var adminUserService = require('../../services/adminUserService');
var bcrypt = require('bcryptjs');

describe('The AdminUsers Service', function() {
  describe('The verifyUser function', function() {
    var findOne, compareSync;

    var adminUser = {
      id: 1,
      userName: 'admin',
      password: 'salted hashed password'
    };

    before(function() {
      findOne = sinon.stub(AdminUser, 'findOne');
      compareSync = sinon.stub(bcrypt, 'compareSync');
    });

    after(function() {
      findOne.restore();
      compareSync.restore();
    });

    it('should return user id if the user password matches the salted-hashed password', function() {
      findOne.withArgs({where: {userName: 'admin'}})
        .returns(Promise.resolve({dataValues: adminUser}));
      compareSync.withArgs('password', 'salted hashed password')
        .returns(adminUser);

      return adminUserService.verifyUser('admin', 'password').should.eventually.deep.equal({id: 1});
    });

    it('should return false if the user does not exist.', function() {
      findOne.withArgs({where: {userName: 'bob'}})
        .returns(Promise.resolve(null));

      return adminUserService.verifyUser('bob', 'password').should.eventually.be.false;
    });

    it('should return false if the password does not match', function() {
      findOne.withArgs({where: {userName: 'admin'}})
        .returns(Promise.resolve(null));
      compareSync.withArgs('wrongpassword', 'salted hashed password')
        .returns(false);

      return adminUserService.verifyUser('admin', 'wrongpassword').should.eventually.be.false;
    });
  });

  describe('The create function', function() {
    var create, genSaltSync, hashSync;

    var newAdminUser = {
      id: 1,
      userName: 'admin',
      password: 'salted hashed password'
    };

    before(function() {
      create = sinon.stub(AdminUser, 'create');
      genSaltSync = sinon.stub(bcrypt, 'genSaltSync');
      hashSync = sinon.stub(bcrypt, 'hashSync');
    });

    after(function() {
      create.restore();
      genSaltSync.restore();
      hashSync.restore();
    });

    it('should resolve with a new adminUser object with username and salted & hashed password', function() {
      genSaltSync.withArgs(10)
        .returns('salt');
      hashSync.withArgs('password', 'salt')
        .returns('salted hashed password');
      create.withArgs({userName: 'admin', password: 'salted hashed password'})
        .returns(Promise.resolve({dataValues: newAdminUser}));

      return adminUserService.create('admin', 'password').should.eventually.deep.equal(newAdminUser);
    });
  });
});
