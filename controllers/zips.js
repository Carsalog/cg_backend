const Joi = require("joi");
const config = require("config");
const {Zip} = require("../models/zips");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const _ = require("lodash");
const controller = {};
const {getZip} = require("../lib/utils");


controller.get = async (req, res) => {
  /**
   * Return state and city by zip code
   * @return Promise:
   */

  let zip = await Zip.getByZip(req.params.id);

  // Try to get zip code from google api
  if (!zip) zip = await getZip(req.params.id);

  // If zip doesn't exist return error
  if (!zip) return res.status(404).send({error: "Cannot find this zip code"});

  return res.send(_.pick(zip, ["_id", "city", "state", "loc"]));
};


controller.post = async (req, res) => {
  /**
   * Create a zip object
   * @return Promise:
   */

  const {error} = validate(req.body);
  if (error) return res.status(400).send({error: error.details[0].message});

  const state = await State.getByName(req.body.state);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  const city = await City.getByName(req.body.city, state._id);
  if (!city) return res.status(404).send({error: "Cannot find this city"});

  const zip = await Zip({
    _id: req.body._id,
    city: city._id,
    state: state._id,
    loc: req.body.loc
  }).save();

  return res.send(_.pick(zip, ["_id", "state", "city", "loc"]));
};


controller.put = async (req, res) => {
  /**
   * Update and return zip info
   * @return Promise:
   */

  const state = await State.getById(req.body.state);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  const city = await City.getById(req.body.city);
  if (!city) return res.status(404).send({error: "Cannot find this city"});

  const item = await Zip.update(req.body, req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this city"});

  return res.send(_.pick(item, ["_id", "city", "state", "loc"]));
};


controller.delete = async (req, res) => {
  /**
   * Remove zip code
   * @return Promise:
   */

  const item = await Zip.findByIdAndRemove(req.params.id);

  if (!item) return res.status(404).send({error: "Cannot find this zip"});

  return res.send(_.pick(item, ["_id", "city", "state", "loc"]));
};


function validate(obj) {
  /**
   * Validate model fields
   * @return object:
   */

  return Joi.validate(obj, {
    _id: Joi.number().integer()
      .min(config.get("zips.id.min"))
      .max(config.get("zips.id.max"))
      .required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    loc: Joi.object().keys({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required()
  });
}

module.exports = controller;