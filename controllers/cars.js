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


controller.getById = async (req, res) => {
  /**
   * Get car by id
   * @return Object:
   */

  const car = await Car.getById(req.params.id);
  if (!car) return res.status(404).send({error: "Cannot find the car"});

  return res.send(car);
};

module.exports = controller;