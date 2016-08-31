var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
chai.should();
var should = chai.should();

var jwt = require('jsonwebtoken');
var secret = process.env.SECRET || 'development_secret';
var authService = require('../../services/authService');

describe('The authService', function() {
  describe('The getUserToken function', function() {
    var sign;
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNDcyMDk1MTk2fQ.nzF4rW_BBKAmEkwX_565YLh0SCcgwcMNEYqVFyejs_M';
    var userId = 1;
    var role = 'user';

    beforeEach(function() {
      sign = sinon.stub(jwt, 'sign');
    });

    afterEach(function() {
      sign.restore();
    });

    it('should return a JWT given the user ID and role', function() {
      sign.withArgs({userId: userId, role: role}, secret)
        .returns(token);

      var userToken = authService.getUserToken(userId, role);
      userToken.should.equal(token);
    });

    it('should return a JWT if role is missing (will provide a default)', function() {
      sign.withArgs({userId: userId, role: role}, secret)
        .returns(token);

      var userToken = authService.getUserToken(userId);
      userToken.should.equal(token);
    });

    it('should throw an error if userId is not provided', function() {
      chai.expect(function() {
        authService.getUserToken();
      }).to.throw(Error, 'userId must be provided');
    })
  });

  describe('The verifyUserToken function', function() {
    var verify;
    var payload = {
      userId: 1,
      role: 'user'
    };
    var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNDcyMDk1MTk2fQ.nzF4rW_BBKAmEkwX_565YLh0SCcgwcMNEYqVFyejs_M';

    beforeEach(function() {
      verify = sinon.stub(jwt, 'verify');
    });

    afterEach(function() {
      verify.restore();
    });

    it('should return an object containing userId and role if token is valid', function() {
      verify.withArgs(token, secret)
        .returns(payload);

      var userToken = authService.verifyUserToken(token);
      userToken.should.equal(payload);
    });

    it('should throw an error if verification fails', function() {
      verify.withArgs('wrong token', secret)
        .throws(new jwt.JsonWebTokenError);

      chai.expect(function() {
        authService.verifyUserToken('wrong token')
      }).to.throw(jwt.JsonWebTokenError);
    });

    it('should throw an error if token is not provided', function() {
      chai.expect(function() {
        authService.verifyUserToken();
      }).to.throw(Error, 'token must be provided');
    })
  });

  describe('The generateConfirmCode function', function() {
    it('should be six digits long', function() {
      var code = authService.generateConfirmCode();

      code.length.should.equal(6);
    })
  });

  describe('The getUserData function', function() {
    var verify;

    beforeEach(function() {
      verify = sinon.stub(jwt, 'verify');
    });

    afterEach(function() {
      verify.restore();
    });

    it('should return user data if token is valid', function() {
      verify.withArgs('a valid user token', 'development_secret')
        .returns({userId: 1, role: 'user'});

      authService.getUserData('a valid user token')
        .should.deep.equal({userId :1, role: 'user'});
    });

    it('should return false if token is invalid', function() {
      verify.withArgs('an invalid token', 'development_secret')
        .throws(new jwt.JsonWebTokenError());

      authService.getUserData('an invalid token').should.be.false;
    });


    it('should return false no token is provided', function() {
      authService.getUserData(undefined).should.be.false;
    })
  })

});
