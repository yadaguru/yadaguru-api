'use strict';
module.exports = function(sequelize, DataTypes) {
  var ContentItem = sequelize.define('ContentItem', {
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    content: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return ContentItem;
};
