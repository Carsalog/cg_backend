const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const city = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("cities.name.min"),
    maxlength: config.get("cities.name.max"),
    required: true,
    lowercase: true,
    unique: true,
    trim: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("states.tableName"))
  },
});

city.statics.getById = function (_id) {

  return this.findById(_id).select("-__v");
};

city.statics.getByPage = function (page, amount) {

  return this.find().skip((page - 1) * amount).limit(amount).sort({name: 1}).select("-__v");
};

city.statics.create = function (data) {

  return this({name: data.name, state: data.state}).save();
};

city.statics.getByName = function (name, _id) {

  return this.findOne({name: { "$regex": name, "$options": "i" }, state: _id}).select("-__v");
};

city.statics.update = async function (obj, _id) {

  // Try to get a city
  const current = await this.findById(_id);
  if (!current) return null;

  // Update and return the city
  current.name = obj.name;
  return current.save();
};

city.statics.deleteById = function(_id) {

  return this.findByIdAndRemove(_id);
};

exports.City = mongoose.model(String(config.get("cities.tableName")), city);

