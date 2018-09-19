const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");

const zip = new mongoose.Schema({
  _id: {
    type: Number,
    required: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("states.tableName"))
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: String(config.get("states.tableName"))
  },
  loc: [{
    type: Number
  }],
  pop: {
    type: Number,
    min: config.get("zips.pop.min"),
    max: config.get("zips.pop.max")
  }
});

exports.Zip = mongoose.model(String(config.get("zips.tableName")), zip);
