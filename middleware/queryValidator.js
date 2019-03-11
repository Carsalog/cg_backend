const config = require("config");
const Joi = require("joi");


function validate(parameters) {

  return Joi.validate(parameters, {
    page: Joi.number().integer().min(1).max(99999),
    amount: Joi.number().integer().min(1).max(250)
  });
}

module.exports = function (req, res, next) {

  // Validate GET parameters
  const {error} = validate(req.query);
  if (error) return res.status(400).send({error: error.details[0].message});

  // Define GET parameters
  const page = req.query.page || config.get("defaultPage"),
    amount = req.query.amount || config.get("itemsByPage");

  // Add new parameters to request
  req.params.page = Number(page);
  req.params.amount = Number(amount);

  // Run next function
  next();
};
