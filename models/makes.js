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
  }
});

// Create Make model
const Make = mongoose.model(String(config.get("makes.tableName")), makeSchema);

async function getById(itemId) {
  /**
   * Returns a car make by id
   * @return Promise:
   */
  return await Make.findById(itemId).select("-__v");
}

async function getByPage(page, amount) {
  /**
   * Get list of makes by page/amount (pagination)
   * @return Promise:
   */
  return await Make.find()
    .skip((page - 1) * amount).limit(amount).sort({name: 1})
    .select("-__v");
}

async function create(name) {
  /**
   * Create a new make of cars
   * @return Promise:
   */
  const type = new Make(name);
  return await type.save();
}

async function getByName(name) {
  /**
   * Return car type or none
   */
  return await Make.findOne({name: { "$regex": name, "$options": "i" }}).select("-__v");
}

async function update(obj, _id) {
  /**
   * Update a car model
   * @return Promise:
   */

  // Try to get a car type
  const current = await Make.findById(_id);
  if (!current) return null;

  // Update and return a car type
  current.name = obj.name;
  return await current.save();
}

async function remove(objectId) {
  /**
   * Remove a car type
   * @return Promise:
   */
  return await Make.findByIdAndRemove(objectId);
}

function validate(object) {
  /**
   * Validate model fields
   * @return object:
   */
  const schema = {
    _id: Joi.objectId(),
    name: Joi.string().min(config.get("makes.name.min")).max(config.get("makes.name.max")).required()
  };
  return Joi.validate(object, schema);
}

exports.Make = Make;
exports.validate = validate;
exports.getById = getById;
exports.getByPage = getByPage;
exports.create = create;
exports.update = update;
exports.remove = remove;
exports.getByName = getByName;
