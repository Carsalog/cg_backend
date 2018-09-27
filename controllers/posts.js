const {Post} = require("../models/posts");
const {User} = require("../models/users");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const {Make} = require("../models/makes");
const {Model} = require("../models/models");
const _ = require("lodash");
const controller = {};


controller.get = async (req, res) => {
  /**
   * Get amount of posts by page
   * @return Object:
   */

  let make = null, model = null;
  const data = req.params;

  if (!data.city) return res.status(400).send({error: "Cannot read city"});
  if (!data.state) return res.status(400).send({error: "Cannot read state"});

  const state = await State.getByName(data.state);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  const city = await City.getByName(data.city, state._id);
  if (!city) return res.status(404).send({error: "Cannot find this city"});

  if (data.make) make = await Make.getByName(data.make);
  if (data.model) model = await Model.getByName(data.model, make._id);

  if (data.make && !make) return res.status(404).send({error: "Cannot find this make"});
  if (data.model && !model) return res.status(404).send({error: "Cannot find this model"});

  return res.send(await Post.getByPage(
    data.page, data.amount, city._id, state._id, make, model, data.yearMin, data.yearMax));
};

module.exports = controller;