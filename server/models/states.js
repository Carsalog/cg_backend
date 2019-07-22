const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const state = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("states.name.min"),
    maxlength: config.get("states.name.max"),
    lowercase: true,
    required: true,
    unique: true,
    trim: true
  },
  abbreviation: {
    type: String,
    minlength: config.get("states.abbreviation.min"),
    maxlength: config.get("states.abbreviation.max"),
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  cities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("cities.tableName"))
  }],
});

state.statics.getById = function (_id) {
  /**
   * Returns a car make by id
   * @return Promise:
   */
  return this.findById(_id).populate("cities", "name").select("-__v");
};

state.statics.getByPage = function(page, amount) {
  /**
   * Get list of makes by page/amount (pagination)
   * @return Promise:
   */
  return this.find().skip((page - 1) * amount).limit(amount).sort({name: 1}).select("-__v -cities");
};

state.statics.getByName = function (name) {
  /**
   * Return car type or none
   */
  return this.findOne({name: { "$regex": name, "$options": "i" }}).select("-__v");
};

state.statics.getByAbbreviation = function (abbreviation) {
  /**
   * Return car type or none
   */
  return this.findOne({abbreviation: abbreviation }).select("-__v");
};

state.statics.create = function (data) {
  /**
   * Create a new state
   * @return Promise:
   */
  return this(data).save();
};

state.statics.update = async function (obj, _id) {
  /**
   * Update a state
   * @return Promise:
   */

  // Try to get a car type
  const current = await this.findById(_id);
  if (!current) return null;

  // Update and return a car type
  current.name = obj.name;
  current.abbreviation = obj.abbreviation;
  return current.save();
};

state.statics.delete = function (_id) {
  /**
   * Remove a state
   * @return Promise:
   */
  return this.findByIdAndRemove(_id);
};


exports.State = mongoose.model(String(config.get("states.tableName")), state);
exports.validate = function validate(object) {
  /**
   * Validate model fields
   * @return object:
   */
  return Joi.validate(object, {
    _id: Joi.objectId(),
    name: Joi.string().min(config.get("states.name.min")).max(config.get("states.name.max")).required(),
    abbreviation: Joi.string().min(config.get("states.abbreviation.min")).max(config.get("states.abbreviation.max")).required(),
    cities: Joi.array().items(Joi.objectId())
  });
};

