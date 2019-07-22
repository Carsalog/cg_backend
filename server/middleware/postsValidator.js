const config = require("config");
const Joi = require("joi");
const {getCurrentYear} = require("../lib/tools");
const currentYear = getCurrentYear();

function validate(parameters) {
  /**
   * Validation of get params
   * @type {{page: *, amount: *}}
   */
  const schema = {
    page: Joi.number().integer().min(1).max(99999),
    amount: Joi.number().integer().min(1).max(250),
    city: Joi.string().min(config.get("cities.name.min")).max(config.get("cities.name.max")),
    state: Joi.string().min(config.get("states.name.min")).max(config.get("states.name.max")),
    make: Joi.string().min(config.get("makes.name.min")).max(config.get("makes.name.max")),
    model: Joi.string().min(config.get("models.name.min")).max(config.get("models.name.max")),
    yearMin: Joi.number().integer().min(config.get("cars.year.min")).max(currentYear),
    yearMax: Joi.number().integer().min(config.get("cars.year.min")).max(currentYear),
    zip: Joi.number().integer()
  };
  return Joi.validate(parameters, schema);
}

module.exports = function (req, res, next) {
  /**
   * Validate GET parameters, if parameters do not pass
   * create parameters with default values or return error
   * message. Then Add to request new parameters, and pass
   * control to next middleware function.
   */

  // Validate GET parameters
  const { error } = validate(req.query);
  if (error) return res.status(400).send({error: error.details[0].message});

  // Define GET parameters
  let page = req.query.page;
  if (!page) page = config.get("defaultPage");
  let amount = req.query.amount;
  if (!amount) amount = config.get("itemsByPage");

  if (req.query.model && !req.query.make)
    return res.status(404).send({error: "Cannot find model without make"});

  // Add new parameters to request
  req.params.page = Number(page);
  req.params.amount = Number(amount);
  req.params.city = req.query.city || null;
  req.params.state = req.query.state || null;
  req.params.make = req.query.make || null;
  req.params.model = req.query.model || null;
  req.params.yearMin = req.query.yearMin || null;
  req.params.yearMax = req.query.yearMax || null;

  // Run next function
  next();
};
