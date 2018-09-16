const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const {getCurrentYear} = require("../lib/tools");
const currentYear = getCurrentYear();

const car  = new mongoose.Schema({
  vin: {
    type: String,
    trim: true,
    uppercase: true,
    required: true,
    unique: true
  },
  make: {
    type: String,
    default: null
  },
  model: {
    type: String,
    default: null
  },
  type: {
    type: String,
    default: null,
    lowercase: true
  },
  fuel: {
    type: String,
    default: null,
    lowercase: true
  },
  year: {
    type: Number,
    required: true,
    min: config.get("cars.year.min"),
    max: currentYear
  }
});


car.statics.create = function(car) {
  /**
   * Create a new car
   *
   * @type {Model}
   * @return Promise:
   */
  return this(car).save();
};

car.statics.getByPage = function(page, amount) {
  /**
   * Return list of cars by page
   * @return Promise:
   */
  return this.find().skip((page - 1) * amount).limit(amount).sort({make: 1}).select("-__v");
};

car.statics.getById = function(_id) {
  /**
   * Get car by id
   * @return Object:
   */
  return this.findById(_id).select("-__v");
};

car.statics.getByVIN = function(vin) {
  /**
   * Get car by id
   * @return Object:
   */
  return this.findOne({vin: vin}).select("-__v");
};

car.statics.update = async function(obj, _id) {
  /**
   * Update car and return car object
   * @return Promise:
   */

  const car = await this.findById(_id);
  if (!car) return null;
  if (car.vin.toUpperCase() !== obj.vin.toUpperCase()) return null;

  car.make = obj.make;
  car.model = obj.model;
  car.type = obj.type;
  car.fuel = obj.fuel;
  car.year = obj.year;

  return car.save();
};

car.statics.delById = async function(_id) {
  /**
   * Remove car by id
   */
  const item = await this.findById(_id);
  if (!item) return null;

  return item.remove();
};

exports.Car = mongoose.model(String(config.get("cars.tableName")), car);

exports.validate = function (obj) {
  /**
   * Validate car object if it invalid return error message
   * @return Error|null:
   */
  const schema = {
    _id: Joi.objectId(),
    vin: Joi.string().length(config.get("cars.vin.length")).regex(/^[A-z\d]{12}\d{5}$/).required(),
    make: Joi.string().required(),
    model: Joi.string().required(),
    type: Joi.string().required(),
    fuel: Joi.string().required(),
    year: Joi.number().integer().min(config.get("cars.year.min")).max(currentYear).required(),
  };
  return Joi.validate(obj, schema);
};

exports.validateVIN = function (object) {
  /**
   * Validation for VIN
   * @return Error|null:
   */
  return Joi.validate(object,
    {vin: Joi.string().length(config.get("cars.vin.length")).regex(/^[A-z\d]{12}\d{5}$/).required()});
};