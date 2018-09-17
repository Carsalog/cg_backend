const {Car, validateVIN} = require("../models/cars");
const nhtsa = require('nhtsa');
const _ = require("lodash");
const controller = {};


controller.get = async (req, res) => {
  /**
   * Get amount of cars by page
   * @return Object:
   */

  res.send(await Car.getByPage(req.params.page, req.params.amount));
};

module.exports = controller;