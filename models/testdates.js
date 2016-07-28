'use strict';
module.exports = function(sequelize, DataTypes) {
  var TestDate = sequelize.define('TestDate', {
    registrationDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    adminDate: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    classMethods: {
      associate: function(models) {
        TestDate.belongsTo(models.Test, {
          onDelete: 'restrict',
          foreignKey: {
            name: 'testId',
            allowNull: false
          }
        });
      }
    }
  });
  return TestDate;
};
