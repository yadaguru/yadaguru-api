'use strict';
module.exports = function(sequelize, DataTypes) {
  var BaseReminder = sequelize.define('BaseReminder', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lateMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lateDetail: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        BaseReminder.belongsTo(models.Category)
      }
    }
  });
  return BaseReminder;
};
