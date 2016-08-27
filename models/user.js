'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    confirmCode: DataTypes.STRING,
    confirmCodeTimestamp: DataTypes.DATE,
    sponsorCode: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.School, {
          onDelete: 'cascade',
          foreignKey: {
            name: 'userId',
            allowNull: false
          }
        });
      }
    }
  });
  return User;
};
