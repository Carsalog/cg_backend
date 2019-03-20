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
   * Get cities by page
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

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a city
   * @return Promise:
   */

  const city = await City.findById(req.params.id);
  if (!city) return res.status(404).send({error: "Cannot find this city"});

  const state = await State.findById(city.state);

  // Get index of a city
  const index = state.cities.indexOf(req.params.id);

  // If city in array remove it
  if (index > -1) {
    state.cities.splice(index, 1);
    await state.save();
  }

  const name = String(city.name);

  await city.remove();

  // Return response
  return res.send({info: `City ${name} was removed`});
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get city by id
   */

  const item = await City.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this city"});

  return res.send(item);
});

module.exports = router;