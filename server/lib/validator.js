const Joi = require("joi");

function validateGET(parameters) {
  /**
   * Validation of get params
   * @type {{page: *, amount: *}}
   */
  const schema = {
    page: Joi.number().integer().min(1).max(99999),
    amount: Joi.number().integer().min(1).max(250)
  };
  return Joi.validate(parameters, schema);
}

exports.validateGET = validateGET;