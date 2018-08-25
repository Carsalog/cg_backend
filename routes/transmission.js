const express = require("express");
const {Transmission, validate} = require("../models/transmission");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");


router.get("/", async (req, res) => {
  /**
   * Get transmissions
   * @return Object:
   */
  return res.send(await Transmission.get());
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get transmission by id
   * @return Object:
   */
  const item = await Transmission.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find the transmission"});

  return res.send(item)
});

router.post("/", [auth, su, valid(validate)], async (req, res) => {
  /**
   * Create a transmission
   * @return Object:
   */
  const item = await Transmission.getByType(req.body.type);
  if (item) return res.send(_.pick(item, ["_id", "type"]));

  return res.status(201).send(_.pick(await Transmission.add(req.body), ["_id", "type"]));
});

router.put("/:id", [auth, su, idValidator, valid(validate)], async (req, res) => {
  /**
   * Update transmission
   * @return Object:
   */
  const item = await Transmission.update(req.body.type, req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this transmission"});

  return res.send(item);
});

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a transmission
   * @return Object:
   */
  const item = await Transmission.delById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find the transmission"});

  return res.send({info: `Transmission ${item.type} was removed`});
});

module.exports = router;
