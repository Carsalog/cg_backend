const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const model = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("models.name.min"),
    maxlength: config.get("models.name.max"),
    required: true,
    unique: true,
    trim: true
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("makes.tableName"))
  },
});

model.statics.getById = function (_id) {
  /**
   * Returns a car model by id
   * @return Promise:
   */
  return this.findById(_id);
};

model.statics.create = function (data) {
  /**
   * Create a new car model
   * @return Promise:
   */
  return this(data).save();
};

model.statics.getByName = function (name, makeId) {
  /**
   * Return car model by name
   * @return Promise:
   */
  return this.findOne({name: { "$regex": name, "$options": "i" }, make: makeId}).select("-__v");
};

model.statics.update = async function (obj, _id) {
  /**
   * Update a car model
   * @return Promise:
   */

  // Try to get a car model
  const current = await this.findById(_id);
  if (!current) return;

  // Update and return a car model
  current.name = obj.name;
  return current.save();
};

exports.Model = mongoose.model(String(config.get("models.tableName")), model);

exports.validate = function (obj) {
  /**
   * Validate model fields
   * @return object:
   */
  
  return Joi.validate(obj, {
    _id: Joi.objectId(),
    name: Joi.string().min(config.get("models.name.min")).max(config.get("models.name.max")).required(),
    make: Joi.objectId().required()
  });
};


