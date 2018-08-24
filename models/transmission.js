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

  return this.find().select("-__v");
};

transmission.statics.getById = function(_id) {

  return this.findById(_id).select("-__v");
};

transmission.statics.getByType = function(type) {

  return this.findOne({type: { "$regex": type, "$options": "i" }}).select("-__v");
};

transmission.statics.add = function(type) {

  return this(type).save();
};

transmission.statics.update = async function(type, _id) {

  const item = await this.getById(_id);
  if (!item) return null;

  item.type = type;
  return item.save();
};

transmission.statics.delById = function(_id) {

  return this.findByIdAndRemove(_id);
};


module.exports.Transmission = mongoose.model(String(config.get("transmission.tableName")), transmission);
