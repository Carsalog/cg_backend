const Joi = require("joi");
const config = require("config");
const {Zip} = require("../models/zips");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const _ = require("lodash");
const controller = {};


controller.get = async (req, res) => {

  const zip = await Zip.findById(req.params.id);
  if (!zip) return res.status(404).send({error: "Cannot find this zip code"});

  return res.send(_.pick(zip, ["_id", "city", "state", "loc", "pop"]));
};

module.exports = controller;