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
      return res.status(500).send({error: "Cannot get the car with given VIN number"});
    });
};

module.exports = controller;