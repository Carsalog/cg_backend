const express = require("express");
const {getById, getByPage, getByName, validate, create, update, remove} = require("../models/makes");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");


router.get("/", validator, async (req, res) => {
  /**
   * Get amount of car makes by page
   * @return Object:
   */
  res.send(await getByPage(req.params.page, req.params.amount));
});

router.post("/", [auth, su], async (req, res) => {
  /**
   * Create a new car make
   * @return Object:
   */

  // validate request
  const { error } = validate(req.body);
  if (error) return res.status(400).send({error: error.details[0].message});

  const item = await getByName(req.body.name);
  if (item) return res.status(200).send(item);

  // Send response to a client
  return res.status(201).send(_.pick(await create(req.body), ["_id", "name"]));
});

router.put('/:id', [auth, su, idValidator], async (req, res) => {
  /**
   * Update a car make
   * @return Object:
   */
  const { error } = validate(req.body);
  if (error) return res.status(400).send({error: error.details[0].message});

  return res.send(_.pick(await update(req.body, req.params.id), ["_id", "name"]));
});

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a car make
   * @return Object:
   */

  // Try to find the car make
  const item = await remove(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this make"});

  // Send response to a client
  return res.send({info: `Make ${item.name} was removed`});
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get make by id and send it to a client
   * @return Object:
   */
  const item = await getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find the make"});

  // Send response to a client
  return res.send(item);
});

module.exports = router;