'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    confirmCode: DataTypes.STRING,
    confirmCodeTimestamp: DataTypes.TIME,
    sponsorCode: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};
