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

module.exports = router;