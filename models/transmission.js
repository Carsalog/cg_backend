const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");


const transmission = new mongoose.Schema({
  type: {
    type: String,
    minlength: config.get("transmission.type.min"),
    maxlength: config.get("transmission.type.max"),
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
});

transmission.statics.get = function() {
  /**
   * Get list of transmissions
   * @return Promise:
   */
  return this.find().select("-__v");
};

transmission.statics.getById = function(_id) {
  /**
   * Get transmissions by id
   * @return Promise:
   */
  return this.findById(_id).select("-__v");
};

transmission.statics.getByType = function(type) {
  /**
   * Get transmissions by type
   * @return Promise:
   */
  return this.findOne({type: { "$regex": type, "$options": "i" }}).select("-__v");
};

transmission.statics.add = function(type) {
  /**
   * Create a transmission
   * @return Promise:
   */

  return this(type).save();
};

transmission.statics.update = async function(type, _id) {
  /**
   * Update transmission type
   * @return Promise:
   */
  const item = await this.getById(_id);
  if (!item) return null;

  item.type = type;
  return item.save();
};

transmission.statics.delById = function(_id) {
  /**
   * Get remove transmission by id
   */
  return this.findByIdAndRemove(_id);
};


module.exports.Transmission = mongoose.model(String(config.get("transmission.tableName")), transmission);


module.exports.validate = function (object) {
  /**
   * Validate transmission fields
   * @return object:
   */
  return Joi.validate(object, {
    _id: Joi.objectId(),
    type: Joi.string().min(config.get("transmission.type.min")).max(config.get("transmission.type.max")).required()
  });
};