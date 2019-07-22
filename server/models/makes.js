const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const makeSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: config.get("makes.name.min"),
    maxlength: config.get("makes.name.max"),
    required: true,
    unique: true,
    trim: true
  },
  models: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("models.tableName"))
  }],
});

makeSchema.statics.getById = function (_id) {
  /**
   * Returns a car make by id
   * @return Promise:
   */
  return this.findById(_id).select("-__v");
};

makeSchema.statics.getByPage = function(page, amount) {
  /**
   * Get list of makes by page/amount (pagination)
   * @return Promise:
   */
  return this.find().skip((page - 1) * amount).limit(amount).sort({name: 1}).select("-__v");
};

makeSchema.statics.getByName = function (name) {
  /**
   * Return car type or none
   */
  return this.findOne({name: { "$regex": name, "$options": "i" }})
    .populate("models", "name").select("-__v");
};

makeSchema.statics.create = function (name) {
  /**
   * Create a new make of cars
   * @return Promise:
   */
  return this(name).save();
};

makeSchema.statics.update = async function (obj, _id) {
  /**
   * Update a car model
   * @return Promise:
   */

  // Try to get a car type
  const current = await this.findById(_id);
  if (!current) return null;

  // Update and return a car type
  current.name = obj.name;
  return current.save();
};

makeSchema.statics.delete = function (_id) {
  /**
   * Remove a car type
   * @return Promise:
   */
  return this.findByIdAndRemove(_id);
};

// Create Make model
const Make = mongoose.model(String(config.get("makes.tableName")), makeSchema);


function validate(object) {
  /**
   * Validate model fields
   * @return object:
   */
  const schema = {
    _id: Joi.objectId(),
    name: Joi.string().min(config.get("makes.name.min")).max(config.get("makes.name.max")).required(),
    models: Joi.array().items(Joi.string().min(config.get("makes.name.min")).max(config.get("makes.name.max")))
  };
  return Joi.validate(object, schema);
}

function validateName(object) {

  const schema = {
    name: Joi.string().min(config.get("makes.name.min")).max(config.get("makes.name.max")).required(),
  };
  return Joi.validate(object, schema);
}

exports.Make = Make;
exports.validate = validate;
exports.validateName = validateName;
