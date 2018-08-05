const mongoose = require("mongoose");

module.exports = function (req, res, next) {
  /**
   * Id validator middleware. Checks that id is valid, else return 404 error
   */

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send({error: "Cannot find anything with given url"});
  }

  next();
};