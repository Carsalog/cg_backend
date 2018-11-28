const {Car, validateVIN} = require("../models/cars");
const nhtsa = require('nhtsa');
const _ = require("lodash");
const controller = {};
const {Make} = require("../models/makes");
const {Model} = require("../models/models");


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


controller.getByVIN = async (req, res) => {
  /**
   * Get car by VIN
   * @return Object:
   */

  const { error } = validateVIN(req.params);
  if (error) return res.status(400).send({error: error.details[0].message});

  const vin = req.params.vin.toUpperCase();

  // Try to find a car
  const car = await Car.getByVIN(vin);
  if (car) return res.send(car);

  // Decoding the VIN
  nhtsa.decodeVinFlatFormat(vin)
    .then(async ({ data }) => {

      // Retrieve data
      if (!data.Results[0]) return res.status(500).send({error: "Server unavailable, try it later"});
      const info = data.Results[0];

      // Create a make if it doesn't exist
      if (!(await Make.getByName(info.Make))) {
        const make = await Make.create({name: info.Make});
        const model = await Model.create({make: make._id, name: info.Model});

        // update make
        make.models.push(model._id);
        await make.save();
      }

      // Create a new car
      await Car.create({
        vin: vin,
        make: info.Make,
        model: info.Model,
        type: info.BodyClass,
        fuel: info.FuelTypePrimary,
        year: Number(info.ModelYear)
      });

      // Send the car object to the client
      return res.status(201).send(await Car.getByVIN(vin));
    })
    .catch(e => {
      console.log(e);
      return res.status(400).send({error: "Cannot get the car with given VIN number"});
    });
};


controller.put = async (req, res) => {
  /**
   * Update car
   * @return Object:
   */

  const _car = await Car.getById(req.params.id);

  if (!_car) return res.status(404).send({error: "Cannot find the car"});
  if (_car.vin !== req.body.vin) return res.status(400).send({error: "VIN doesn't match"});

  const car = await Car.update(req.body, req.params.id);
  if (!car) return res.status(500).send({error: "Something went wrong"});

  return res.send(_.pick(car, ["_id", "make", "model", "type", "fuel", "vin", "year"]));
};

controller.delete = async (req, res) => {
  /**
   * Remove car
   * @return Object:
   */

  const car = await Car.delById(req.params.id);
  if (!car) return res.status(404).send({error: "Cannot find the car"});

  return res.send(_.pick(car, ["_id", "make", "model", "type", "fuel", "vin", "year"]));
};

module.exports = controller;