const {isFloat} = require("../lib/tools");

module.exports = function (req, res, next) {

  const loc = req.body.loc;

  if (!loc || loc.length !== 2) return res.status(400).send({error: "ZIP should have 2 coordinates"});
  if (!isFloat(loc[0]) || !isFloat(loc[1])) return res.status(400).send({error: "Coordinates should be an integer"});

  next();
};