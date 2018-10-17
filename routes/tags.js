const express = require("express");
const {Tag, validate} = require("../models/tags");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const _ = require("lodash");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const valid = require("../middleware/valid");


router.get("/", validator, async (req, res) => {
  /**
   * Get amount of tags by page
   * @return Object:
   */

  res.send(await Tag.getByPage(req.params.page, req.params.amount))
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get a tag by id
   * @return Object:
   */

  const item = await getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this tag"});

  return res.send(item);
});

router.post("/", [auth, valid(validate)], async (req, res) => {
  /**
   * Create a new tag
   * @return Object:
   */

  // Make sure that name is free, if taken send back to client this item
  const item = await getByName(req.body.name);
  if (item) return res.status(200).send(item);

  // Create an object and send it to client
  return res.status(201).send(_.pick(await Tag.create(req.body), ["_id", "name"]));
});

module.exports = router;