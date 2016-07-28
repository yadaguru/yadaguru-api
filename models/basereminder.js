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
        BaseReminder.belongsTo(models.Category, {
          onDelete: 'restrict',
          foreignKey: {
            name: 'categoryId',
            allowNull: false
          }
        });
        BaseReminder.belongsToMany(models.Timeframe, {
          through: 'BaseRemindersTimeframes',
          onDelete: 'restrict'
        });
      }
    }
  });
  return BaseReminder;
};
