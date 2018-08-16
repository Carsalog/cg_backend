const config = require("config");
const {validateGET} = require("../lib/validator");

module.exports = function (req, res, next) {
  /**
   * Validate GET parameters, if parameters do not pass
   * create parameters with default values. Then Add
   * to request new parameters, and pass control to next
   * middleware function.
   */

  // Validate GET parameters
  const { error } = validateGET(req.query);
  if (error) return res.status(400).send({error: error.details[0].message});

  // Define GET parameters
  let page = req.query.page;
  if (!page) page = config.get("defaultPage");
  let amount = req.query.amount;
  if (!amount) amount = config.get("itemsByPage");

  // Add new parameters to request
  req.params.page = Number(page);
  req.params.amount = Number(amount);

  // Run next function
  next();
};
