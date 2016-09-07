'use strict';
module.exports = function(sequelize, DataTypes) {
  var AdminUser = sequelize.define('AdminUser', {
    userName: {
      type: DataTypes.STRING,
      unique: true
    },
    password: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return AdminUser;
};
