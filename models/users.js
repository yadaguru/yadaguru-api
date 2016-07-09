module.exports = function(sequelize, DataTypes) {

  return sequelize.define('User', {
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [10, 10],
        isNumeric: true
      }
    },
    confirmCode: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        max: 6,
        min: 6,
        isNumeric: true
      }
    },
    confirmCodeExpires: {
      type: DataTypes.TIME,
      allowNull: true
    },
    sponsorCode: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'users'
  });

};
