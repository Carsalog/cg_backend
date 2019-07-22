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
  /**
   * Returns a city by id
   * @return Promise:
   */
  return this.findById(_id).select("-__v");
};

city.statics.getByPage = function (page, amount) {
  /**
   * Returns amount of cities by page
   *
   * @return Promise:
   */
  return this.find().skip((page - 1) * amount).limit(amount).sort({name: 1}).select("-__v");
};

city.statics.create = function (data) {
  /**
   * Create a new city
   *
   * @return Promise:
   */
  return this({name: data.name, state: data.state}).save();
};

city.statics.getByName = function (name, _id) {
  /**
   * Returns city by name and state id
   *
   * @return Promise:
   */
  return this.findOne({name: name, state: _id}).select("-__v");
};

city.statics.update = async function (obj, _id) {
  /**
   * Update a city
   *
   * @return Promise:
   */

  // Try to get a city
  const current = await this.findById(_id);
  if (!current) return null;

  // Update and return the city
  current.name = obj.name;
  return current.save();
};

city.statics.deleteById = function(_id) {
  /**
   * Remove a city
   * @return Promise:
   */
  return this.findByIdAndRemove(_id);
};

exports.City = mongoose.model(String(config.get("cities.tableName")), city);

exports.validate = function (obj) {
  /**
   * Validate model fields
   * @return object:
   */
  return Joi.validate(obj, {
    _id: Joi.objectId(),
    name: Joi.string().min(config.get("cities.name.min")).max(config.get("cities.name.max")).required(),
    state: Joi.objectId().required()
  });
};

