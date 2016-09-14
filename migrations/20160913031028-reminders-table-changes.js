'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Reminders', 'name').then(function() {
      return queryInterface.removeColumn('Reminders', 'message').then(function() {
        return queryInterface.removeColumn('Reminders', 'detail').then(function() {
          return queryInterface.removeColumn('Reminders', 'lateMessage').then(function() {
            return queryInterface.removeColumn('Reminders', 'lateDetail').then(function() {
              return queryInterface.addColumn('Reminders', 'baseReminderId', {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                  model: 'BaseReminders',
                  key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
              })
            })
          })
        })
      })
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Reminders', 'baseReminderId').then(function() {
      return queryInterface.addColumn('Reminders', 'name', {
        allowNull: false,
        type: Sequelize.STRING
      }).then(function() {
        return queryInterface.addColumn('Reminders', 'message', {
          allowNull: false,
          type: Sequelize.TEXT
        }).then(function() {
          return queryInterface.addColumn('Reminders', 'detail', {
            allowNull: false,
            type: Sequelize.TEXT
          }).then(function() {
            return queryInterface.addColumn('Reminders', 'lateMessage', {
              allowNull: false,
              type: Sequelize.TEXT
            }).then(function() {
              return queryInterface.addColumn('Reminders', 'lateDetail', {
                allowNull: false,
                type: Sequelize.TEXT
              });
            })
          })
        })
      })
    })
  }
};
