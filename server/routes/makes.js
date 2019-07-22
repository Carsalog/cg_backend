const express = require("express");
const {Make, validate, validateName} = require("../models/makes");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");
const queryValidator = require("../middleware/queryValidator");


router.get("/", queryValidator, async (req, res) => {
  /**
   * Get amount of car makes by page
   * @return Object:
   */
  res.send(await Make.getByPage(req.params.page, req.params.amount).populate("models", "name"));
});


router.get("/by/name/:name", async (req, res) => {
  /**
   * Get make by name and send it to a client
   * @return Object:
   */

  const {error} = validateName({name: req.params.name});
  if (error) return res.status(400).send({error: error.details[0].message});

  const item = await Make.getByName(req.params.name);
  if (!item) return res.status(404).send({error: "Cannot find the make"});

  return res.send(item);
});


router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get make by id and send it to a client
   * @return Object:
   */
  const item = await Make.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find the make"});

  // Send response to a client
  return res.send(item);
});


router.post("/", [auth, su, valid(validate)], async (req, res) => {
  /**
   * Create a new car make
   * @return Object:
   */

  const item = await Make.getByName(req.body.name);
  if (item) return res.status(200).send(item);

  // Send response to a client
  return res.status(201).send(_.pick(await Make.create(req.body), ["_id", "name"]));
});

router.put('/:id', [auth, su, idValidator, valid(validate)], async (req, res) => {
  /**
   * Update a car make
   * @return Object:
   */

  const make = await Make.update(req.body, req.params.id);
  if (!make) return res.status(404).send({error: "Cannot find this make"});

  return res.send(_.pick(make, ["_id", "name"]));
});

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a car make
   * @return Object:
   */

    // Try to find the car make
  const item = await Make.delete(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this make"});

  // Send response to a client
  return res.send({info: `Make ${item.name} was removed`});
});


module.exports = router;