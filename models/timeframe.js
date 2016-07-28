'use strict';
module.exports = function(sequelize, DataTypes) {
  var Timeframe = sequelize.define('Timeframe', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    formula: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        Timeframe.belongsToMany(models.BaseReminder, {through: 'BaseRemindersTimeframes', onDelete: 'restrict'});
      }
    }
  });
  return Timeframe;
};
