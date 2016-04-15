var testsController = function(testsService) {

  var getAll = function(req, res) {

    var tests = testsService.findAll();

    res.status(200);
    res.send(tests);

  };

  var getOne = function(req, res) {

    var test = testsService.findOne(req.params.id);

    res.status(200);
    res.send(test);

  };


  var post = function(req, res) {

    var newTest = {
      type: req.body.type,
      message: req.body.message,
      detail: req.body.detail
    };

    var tests = testsService.create(newTest);

    res.status(200);
    res.send(tests);

  };

  var put = function(req, res) {

    var updatedTest = {
      type: req.body.type,
      message: req.body.message,
      detail: req.body.detail
    };

    var tests = testsService.update(req.params.id, updatedTest);

    res.status(200);
    res.send(tests);

  };

  var del = function(req, res) {

    var tests = testsService.destroy(req.params.id);

    res.status(200);
    res.send(tests);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = testsController;
