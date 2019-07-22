const express = require("express");
const {Type, validate} = require("../models/types");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");


router.get("/", validator, async (req, res) => {
  /**
   * Get amount of car types by page
   * @return Object:
   */
  res.send(await Type.getByPage(req.params.page, req.params.amount));
});

router.post("/", [auth, su, valid(validate)], async (req, res) => {
  /**
   * Create a new car type
   * @return Object:
   */

  const item = await Type.getByName(req.body.name);
  if (item) return res.status(200).send(item);

  // Send response to a client
  return res.status(201).send(_.pick(await Type.create(req.body), ["_id", "name"]));
});

router.put('/:id', [auth, su, idValidator, valid(validate)], async (req, res) => {
  /**
   * Update a car type
   * @return Object:
   */

  const type = await Type.update(req.body.name, req.params.id);
  if (!type) return res.status(404).send({error: "Cannot find this type"});

  return res.send(_.pick(type, ["_id", "name"]));
});

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a car type
   * @return Object:
   */
  // Try to find the car
  const type = await Type.delById(req.params.id);
  if (!type) return res.status(404).send({error: "Cannot find this type"});

  // Send response to a client
  return res.send({info: `Type ${type.name} was removed`});
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get type by id and send it to a client
   * @return Object:
   */
  const type = await Type.getById(req.params.id);
  if (!type) return res.status(404).send({error: "Cannot find the type"});

  // Send response to a client
  return res.send(type);
});

module.exports = router;