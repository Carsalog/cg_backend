const express = require("express");
const {Tag, validate} = require("../models/tags");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const _ = require("lodash");
const idValidator = require("../middleware/idValidator");
const valid = require("../middleware/valid");


router.get("/by/name/:name", async (req, res) => {
  /**
   * Get a tag by id
   * @return Object:
   */

  const tag = {name: req.params.name};

  const {error} = validate(tag);
  if (error) return res.status(400).send({error: error.details[0].message});

  let item = await Tag.getByName(req.params.name);
  if (!item) item = await Tag.create(tag);

  return res.send(item);
});

router.get("/:id", idValidator, async (req, res) => {
  /**
   * Get a tag by id
   * @return Object:
   */

  const item = await Tag.getById(req.params.id);
  if (!item) return res.status(404).send({error: "Cannot find this tag"});

  return res.send(item);
});

router.post("/", [auth, valid(validate)], async (req, res) => {
  /**
   * Create a new tag
   * @return Object:
   */

    // Make sure that name is free, if taken send back to client this item
  const item = await Tag.getByName(req.body.name);
  if (item) return res.status(200).send(item);

  // Create an object and send it to client
  return res.status(201).send(_.pick(await Tag.create(req.body), ["_id", "name"]));
});

router.put('/:id', [auth, su, idValidator, valid(validate)], async (req, res) => {
  /**
   * Update tag
   * @return Object:
   */

  const tag = await Tag.update(req.body, req.params.id);
  if (!tag) return res.status(404).send({error: "Cannot find the tag"});

  return res.send(_.pick(tag, ["_id", "name"]));
});

router.delete("/:id", [auth, su, idValidator], async (req, res) => {
  /**
   * Remove a tag
   * @return Object:
   */

  const tag = await Tag.delById(req.params.id);
  if (!tag) return res.status(404).send({error: "Cannot find this tag"});

  return res.send({info: `Tag ${tag.name} was removed`});
});


module.exports = router;