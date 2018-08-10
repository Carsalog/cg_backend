const express = require("express");
const {City, validate} = require("../models/cities");
const {State} = require("../models/states");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");


module.exports = router;