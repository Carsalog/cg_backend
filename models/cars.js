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

  return this(car).save();
};

car.statics.getById = function(_id) {

  return this.findById(_id).select("-__v");
};

car.statics.getByVIN = function(vin) {

  return this.findOne({vin: vin}).select("-__v");
};

car.statics.getByPage = function(page, amount) {
  return this.find()
    .skip((page - 1) * amount)
    .select("-__v")
    .limit(amount);
};

car.statics.update = function(obj, _id) {

  const car = this.findById(_id);
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

  const item = await this.findById(_id);
  if (!item) return null;

  return item.remove();
};

exports.Car = mongoose.model(String(config.get("cars.tableName")), car);
