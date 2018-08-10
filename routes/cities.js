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
   * Get amount of cities by page
   * @return Promise:
   */
  const state = await State.getById(req.params.id);
  if (!state) return res.status(404).send({error: "Cannot find this state"});

  return res.send(state.cities);
});

module.exports = router;