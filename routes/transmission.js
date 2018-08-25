const express = require("express");
const {Transmission, validate} = require("../models/transmission");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const idValidator = require("../middleware/idValidator");
const _ = require("lodash");
const valid = require("../middleware/valid");




module.exports = router;
