const {Post, schema} = require("../models/posts");
const {User} = require("../models/users");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const {Make} = require("../models/makes");
const {Model} = require("../models/models");
const _ = require("lodash");
const controller = {};
const keys = [..._.keys(schema), "_id"];

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


controller.getByUserId = async (req, res) => {
  /**
   * Get post by id and send it to a client
   * @return Object:
   */


  return res.send(await Post.getPostsByUserId(req.params.id));
};


controller.getById = async (req, res) => {
  /**
   * Get post by id and send it to a client
   * @return Object:
   */

  const item = await Post.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this post"});

  return res.send(item);
};


controller.post = async (req, res) => {
  /**
   * Create a new post
   * @return Object:
   */

  return res.status(201).send(_.pick(await Post.create(req.body), keys));
};


controller.put = async (req, res) => {
  /**
   * Update a post
   * @return Object:
   */

  return res.send(_.pick(await Post.update(req.body, req.params.id), keys));
};


controller.delete = async (req, res) => {
  /**
   * Remove a post
   * @return Object:
   */

  const user = await User.getById(req.user._id);
  if(!user) return res.status(404).send({error: "Cannot find this user"});

  const item = await Post.getById(req.params.id);

  if (!item) return res.status(404).send({error: "Cannot find this post"});

  // If user isn't author and isn't admin return error message
  if (!user.su && String(user._id) !== String(item.author._id))
    return res.status(403).send({error: "You cannot remove this post"});

  await item.remove();

  return res.send({info: "This post was removed"});
};

module.exports = controller;
