const express = require("express");
const {City, validate} = require("../models/cities");
const {State} = require("../models/states");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");


router.get("/by/state/:id", idValidator, async (req, res) => {
  /**
   * Get amount of cities by page
   * @return Promise:
   */
  const state = await State.getById(req.params.id);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  return res.send(state.cities);
});

router.post("/", [auth, valid(validate)], async (req, res) => {
  /**
   * Create a new city
   * @return Promise:
   */

  const state = await State.findById(req.body.state);
  if(!state) return res.status(404).send({error: "Cannot find this state"});

  const item = await City.getByName(req.body.name, state._id);
  if (item) return res.status(200).send(item);

  const city = await City.create(req.body);

  state.cities.push(city._id);
  await state.save();

  return res.status(201).send(_.pick(city, ["_id", "name", "state"]));
});

router.put('/:id', [auth, su, idValidator, valid(validate)], async (req, res) => {
  /**
   * Update a city
   * @return Promise:
   */

  const state = await State.findById(req.body.state);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  const item = await City.update(req.body, req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this city"});

  return res.send(_.pick(item, ["_id", "name", "state"]));
});

module.exports = router;