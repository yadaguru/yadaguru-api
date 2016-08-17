var baseDbService = function(Model, outputSanitizer) {

  var _sanitizeOutput = function(data) {
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (outputSanitizer) {
      data = data.map(function(row) {
        return outputSanitizer(row);
      })
    }

    return data;

  };

  var findAll = function() {
    return Model.findAll().then(function(rows) {
      return _sanitizeOutput(rows.map(function(row) {
        return row.dataValues;
      }));
    })
  };

  var findByUser = function(userId) {
    return Model.findAll({where: {userId: userId}}).then(function(rows) {
      return _sanitizeOutput(rows.map(function(row) {
        return row.dataValues;
      }))
    })
  };

  var findById = function(id) {
    return Model.findById(id).then(function(row) {
      if (!row) {
        return [];
      }
      return _sanitizeOutput(row.dataValues);
    })
  };

  var create = function(data) {
    return Model.create(data).then(function(newRow) {
      return _sanitizeOutput(newRow.dataValues);
    })
  };

  var update = function(id, data) {
    return Model.findById(id).then(function(row) {
      if (!row) {
        return Promise.resolve(false);
      }
      return row.update(data).then(function(updatedRow) {
        return _sanitizeOutput(updatedRow.dataValues);
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
    findByUser: findByUser,
    findById: findById,
    create: create,
    update: update,
    destroy: destroy
  }

};

module.exports = baseDbService;
