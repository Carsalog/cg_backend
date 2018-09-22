const express = require("express");
const {Model, validate} = require("../models/models");
const {Make} = require("../models/makes");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");


router.get("/by/make/:id", idValidator, async (req, res) => {
  /**
   * Get amount of cars by page
   * @return Promise:
   */

  const make = await Make.getById(req.params.id);
  if (!make) return res.status(404).send({error: "Cannot find this make"});

  return res.send(make.models);
});

router.post("/", [auth, valid(validate)], async (req, res) => {
  /**
   * Create a new car model
   * @return Promise:
   */

  const make = await Make.findById(req.body.make);
  if (!make) return res.status(404).send({error: "Cannot find this make"});

  const item = await Model.getByName(req.body.name, req.body.make);
  if (item) return res.status(200).send(item);

  const model = await Model.create(req.body);

  make.models.push(model._id);
  await make.save();


  return res.status(201).send(_.pick(model, ["_id", "name", "make"]));
});

router.put('/:id', [auth, su, idValidator, valid(validate)], async (req, res) => {
  /**
   * Update a car model
   * @return Promise:
   */

  const make = await Make.findById(req.body.make);
  if (!make) return res.status(404).send({error: "Cannot find this make"});

  const item = await Model.update(req.body, req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this model"});

  return res.send(_.pick(item, ["_id", "name", "make"]));
});

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a car model
   * @return Promise:
   */

  // Try to find the car model
  const item = await Model.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find the car model"});

  const name = String(item.name);

  const make = await Make.getById(item.make);

  // Get index of a model
  const index = make.models.indexOf(item._id);

  // If model in array remove it
  if (index > -1) {
    make.models.splice(index, 1);
    await make.save();
  }

  await item.remove();

  return res.send({info: `Model ${name} was removed`});
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get car model by id
   */

  const item = await Model.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find the car model"});

  return res.send(item);
});

module.exports = router;