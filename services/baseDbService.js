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

  var findByResource = function(resource, id) {
    var where = {};
    where[resource] = id;
    return Model.findAll({where: where}).then(function(rows) {
      if (rows.length === 0) {
        return rows;
      }
      return _sanitizeOutput(rows.map(function(row) {
        return row.dataValues;
      }));
    })
  };

  var findByResourceForUser = function(resource, id, userId) {
    var where = {};
    where[resource.toLowerCase() + 'Id'] = id;
    where.userId = userId;
    return Model.findAll({where: where}).then(function(rows) {
      if (rows.length === 0) {
        return rows;
      }
      return _sanitizeOutput(rows.map(function(row) {
        return row.dataValues;
      }));
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

  var findByName = function(name) {
    return Model.findAll({where: {name: name}}).then(function(row) {
      if (row.length === 0) {
        return [];
      }
      return _sanitizeOutput(row[0].dataValues);
    })
  };

  var findByUser = function(userId) {
    return Model.findAll({where: {userId: userId}}).then(function(rows) {
      return _sanitizeOutput(rows.map(function(row) {
        return row.dataValues;
      }))
    })
  };

  var findByIdForUser = function(id, userId) {
    return Model.findOne({where: {id: id, userId: userId}}).then(function(row) {
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

  var bulkCreate = function(data) {
    return Model.bulkCreate(data).then(function(newRows) {
      return newRows.length;
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

  var updateForUser = function(id, data, userId) {
    return Model.findOne({where: {id: id, userId: userId}}).then(function(row) {
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

  var destroyForUser = function(id, userId) {
    return Model.findOne({where: {id: id, userId: userId}}).then(function(row) {
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
    findByResource: findByResource,
    findByResourceForUser: findByResourceForUser,
    findById: findById,
    findByName: findByName,
    findByIdForUser: findByIdForUser,
    findByUser: findByUser,
    create: create,
    bulkCreate: bulkCreate,
    update: update,
    updateForUser: updateForUser,
    destroy: destroy,
    destroyForUser: destroyForUser
  }

};

module.exports = baseDbService;
