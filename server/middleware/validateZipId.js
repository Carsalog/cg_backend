const {isInt} = require("../lib/tools");
const config = require("config");

module.exports = function (req, res, next) {
  /**
   * Zip id validator middleware. Checks that id is valid, else return 404 error
   */

  if (!isInt(req.params.id) || config.get("zips.id.min") > Number(req.params.id) > config.get("zips.id.max"))
    return res.status(404).send({error: "Cannot find this zip"});

  next();
};