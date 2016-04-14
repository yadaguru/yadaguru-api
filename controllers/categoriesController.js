var categoriesController = function(categoriesService) {

  var getAll = function(req, res) {

    var categories = categoriesService.findAll();

    res.status(200);
    res.send(categories);

  };

  var getOne = function(req, res) {

    var category = categoriesService.findOne(req.params.id);

    res.status(200);
    res.send(category);

  };


  var post = function(req, res) {

    var newCategory = {
      name: req.body.name
    };

    var categories = categoriesService.create(newCategory);

    res.status(200);
    res.send(categories);

  };

  var put = function(req, res) {

    var updatedCategory = {
      name: req.body.name
    };

    var categories = categoriesService.update(req.params.id, updatedCategory);

    res.status(200);
    res.send(categories);

  };

  var del = function(req, res) {

    var categories = categoriesService.destroy(req.params.id);

    res.status(200);
    res.send(categories);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = categoriesController;