const {isFloat} = require("../lib/tools");

module.exports = function (req, res, next) {
  /**
   * Zip id validator middleware. Checks that id is valid, else return 404 error
   */

  const loc = req.body.loc;

  if (!loc) return res.status(400).send({error: "ZIP should have 2 coordinates"});
  if (!loc.lat) return res.status(400).send({error: "ZIP should have a latitude"});
  if (!loc.lng) return res.status(400).send({error: "ZIP should have a longitude"});
  if (!isFloat(loc.lat) || !isFloat(loc.lng))
    return res.status(400).send({error: "Coordinates should be an integer"});

  next();
};