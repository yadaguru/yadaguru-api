'use strict';
module.exports = function(sequelize, DataTypes) {
  var Test = sequelize.define('Test', {
    type: {
      allowNull: false,
      type: DataTypes.STRING
    },
    registrationMessage: {
      allowNull: false,
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    registrationDetail: {
      allowNull: false,
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    adminMessage: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    adminDetail: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  }, {
    classMethods: {
      associate: function(models) {
        Test.hasMany(models.TestDate, {
        onDelete: 'restrict',
          foreignKey: {
            name: 'testId',
            allowNull: false
          }
        });
      }
    }
  });
  return Test;
};
