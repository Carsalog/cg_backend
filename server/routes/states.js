const express = require("express");
const {State, validate} = require("../models/states");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");


router.get("/", validator, async (req, res) => {
  /**
   * Get amount of states by page
   * @return Object:
   */

  res.send(await State.getByPage(req.params.page, req.params.amount));
});

router.post("/", [auth, su, valid(validate)], async (req, res) => {
  /**
   * Create a new state
   * @return Object:
   */

  const item = await State.getByName(req.body.name);
  if (item) return res.status(200).send(item);

  // Send response to a client
  return res.status(201).send(_.pick(await State.create(req.body), ["_id", "name", "abbreviation"]));
});

router.put('/:id', [auth, su, idValidator, valid(validate)], async (req, res) => {
  /**
   * Update a state
   * @return Object:
   */

  const state = await State.update(req.body, req.params.id);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  return res.send(_.pick(state, ["_id", "name", "abbreviation"]));
});

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a state
   * @return Object:
   */

  // Try to find the state
  const state = await State.findById(req.params.id);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  const name = String(state.name);
  await state.remove();

  // Send response to a client
  return res.send({info: `State ${name} was removed`});
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get state by id and send it to a client
   * @return Object:
   */

  const item = await State.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find the State"});

  // Send response to a client
  return res.send(item);
});

module.exports = router;