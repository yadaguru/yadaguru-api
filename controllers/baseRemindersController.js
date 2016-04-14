var baseRemindersController = function(baseRemindersService) {

  var getAll = function(req, res) {

    var baseReminders = baseRemindersService.findAll();

    res.status(200);
    res.send(baseReminders);

  };

  var getOne = function(req, res) {

    var baseReminder = baseRemindersService.findOne(req.params.id);

    res.status(200);
    res.send(baseReminder);

  };


  var post = function(req, res) {

    var newBaseReminder = {
      name: req.body.name,
      message: req.body.message,
      detail: req.body.detail,
      lateMessage: req.body.lateMessage,
      lateDetail: req.body.lateDetail,
      timeframes: req.body.timeframes,
      category: req.body.category
    };

    var baseReminders = baseRemindersService.create(newBaseReminder);

    res.status(200);
    res.send(baseReminders);

  };

  var put = function(req, res) {

    var updatedBaseReminder = {
      name: req.body.name,
      message: req.body.message,
      detail: req.body.detail,
      lateMessage: req.body.lateMessage,
      lateDetail: req.body.lateDetail,
      timeframes: req.body.timeframes,
      category: req.body.category
    };

    var baseReminders = baseRemindersService.update(req.params.id, updatedBaseReminder);

    res.status(200);
    res.send(baseReminders);

  };

  var del = function(req, res) {

    var baseReminders = baseRemindersService.destroy(req.params.id);

    res.status(200);
    res.send(baseReminders);

  };

  return {
    getAll: getAll,
    getOne: getOne,
    post: post,
    put: put,
    del: del
  }

};

module.exports = baseRemindersController;