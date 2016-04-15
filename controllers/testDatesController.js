var testDatesController = function(testDatesService) {

  var getAll = function(req, res) {

    var testDates = testDatesService.findAll();

    res.status(200);
    res.send(testDates);

  };

  var getOne = function(req, res) {

    var testDate = testDatesService.findOne(req.params.id);

    res.status(200);
    res.send(testDate);

  };


  var post = function(req, res) {

    var newTestDate = {
      test: req.body.test,
      registrationDate: req.body.registrationDate,
      adminDate: req.body.adminDate
    };

    var testDates = testDatesService.create(newTestDate);

    res.status(200);
    res.send(testDates);

  };

  var put = function(req, res) {

    var updatedTestDate = {
      test: req.body.test,
      registrationDate: req.body.registrationDate,
      adminDate: req.body.adminDate
    };

    var testDates = testDatesService.update(req.params.id, updatedTestDate);

    res.status(200);
    res.send(testDates);

  };

  var del = function(req, res) {

    var testDates = testDatesService.destroy(req.params.id);

    res.status(200);
    res.send(testDates);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = testDatesController;
