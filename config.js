module.exports = {
  DEV: {
    connectionString: 'postgres://yadaguru:yadaguru@localhost:15432/yadaguru',
    sequelizeOptions: {
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
      }
    },
    dbSyncOptions: {
      force: false
    }
  },
  TEST: {
    connectionString: 'postgres://yadaguru:yadaguru@localhost:15432/yadagurutest',
    sequelizeOptions: {
      define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true
      }
    },
    dbSyncOptions: {
      force: true
    }
  }
};
