const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const type = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("types.name.min"),
    maxlength: config.get("types.name.max"),
    required: true,
    unique: true,
    trim: true
  }
});

type.statics.getById = function(_id) {
  /**
   * Returns a car type by id
   * @return Promise:
   */
  return this.findById(_id).select("-__v");
};

type.statics.getByPage = function (page, amount) {
  return this.find()
    .skip((page - 1) * amount).limit(amount).sort({name: 1})
    .select("-__v");
};

type.statics.getByName = function(name) {
  /**
   * Return car type or none
   */
  return this.findOne({name: { "$regex": name, "$options": "i" }}).select("-__v");
};

type.statics.create = function (type) {
  /**
   * Create a new type of cars
   * @return Promise:
   */
  return this(type).save();
};

type.statics.update = async function (name, _id) {
  /**
   * Update a car type
   * @return Promise:
   */

  // Try to get a car type
  const current = await this.findById(_id);
  if (!current) return null;

  // Update and return a car type
  current.name = name;
  return  current.save();
};

type.statics.delById = function (_id) {
  /**
   * Remove a car type
   * @return Promise:
   */
  return this.findByIdAndRemove(_id);
};

exports.Type = mongoose.model(String(config.get("types.tableName")), type);

exports.validate = function (type) {
  /**
   * Validate model fields
   * @return object:
   */

  return Joi.validate(type, {
    _id: Joi.objectId(),
    name: Joi.string().min(config.get("types.name.min")).max(config.get("types.name.max")).required()
  });
};