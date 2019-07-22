const {User} = require("../models/users");
const {Car} = require("../models/cars");
const {Transmission} = require("../models/transmission");
const {State} = require("../models/states");
const {City} = require("../models/cities");
const {Make} = require("../models/makes");
const {Model} = require("../models/models");

module.exports = async function (req, res, next) {
  /**
   * Id validator middleware. Checks that id is valid, else return 404 error
   */

  let post = req.body;

  if (!(await User.getById(req.user._id))) return res.status(404).send({error: "Cannot find this user"});
  if (!(await Car.getById(post.car))) return res.status(404).send({error: "Cannot find this car"});
  if (!(await Make.getById(post.make))) return res.status(404).send({error: "Cannot find this make"});
  if (!(await Model.getById(post.model))) return res.status(404).send({error: "Cannot find this model"});
  if (!(await State.getById(post.state))) return res.status(404).send({error: "Cannot find this state"});

  const city = await City.getById(req.body.city);
  if (!city) return res.status(404).send({error: "Cannot find this city"});
  if (String(city.state) !== req.body.state) return res.status(400).send({error: "City and state doesn't match"});

  if (!(await Transmission.getById(post.transmission)))
    return res.status(404).send({error: "Cannot find this transmissions type"});

  req.body.author = req.user._id;

  next();
};