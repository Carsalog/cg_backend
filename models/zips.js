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
    ref: String(config.get("cities.tableName"))
  },
  loc: {
    lat: Number,
    lng: Number
  }
});

zip.statics.getByZip = function (_id) {
  /**
   * Return zip by zip code
   * @return Promise:
   */

  return this.findById(_id)
    .populate("state", ["name", "abbreviation"])
    .populate("city", ["name"])
};

zip.statics.update = async function (data, _id) {
  /**
   * Update zip
   * @return Promise:
   */

  const item = await this.findById(_id);
  if (!item) return null;

  item.city = data.city;
  item.state = data.state;
  item.loc = data.loc;

  return item.save();
};

exports.Zip = mongoose.model(String(config.get("zips.tableName")), zip);

exports.validate = function (obj) {
  /**
   * Validate model fields
   * @return object:
   */

  return Joi.validate(obj, {
    _id: Joi.number().integer()
      .min(config.get("zips.id.min"))
      .max(config.get("zips.id.max"))
      .required(),
    city: Joi.objectId().required(),
    state: Joi.objectId().required(),
    loc: Joi.object().keys({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required()
  });
};
