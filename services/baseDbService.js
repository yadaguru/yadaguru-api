var baseDbService = function(Model) {

  var findAll = function() {
    return Model.findAll().then(function(rows) {
      return rows.map(function(row) {
        return row.dataValues;
      })
    })
  };

  var findById = function(id) {
    return Model.findById(id).then(function(row) {
      if (!row) {
        return [];
      }
      return [row.dataValues];
    })
  };

  var create = function(data) {
    return Model.create(data).then(function(newRow) {
      return [newRow.dataValues];
    })
  };

  var update = function(id, data) {
    return Model.findById(id).then(function(row) {
      if (!row) {
        return Promise.resolve(false);
      }
      return row.update(data).then(function(updatedRow) {
        return [updatedRow.dataValues]
      })
    });
  };

  var destroy = function(id) {
    return Model.findById(id).then(function(row) {
      if (!row) {
        return Promise.resolve(false);
      }
      return row.destroy().then(function() {
        return true;
      })
    })
  };

  return {
    findAll: findAll,
    findById: findById,
    create: create,
    update: update,
    destroy: destroy
  }

};

module.exports = baseDbService;
