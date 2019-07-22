const express = require("express");
const {validate} = require("../models/cars");
const router = express.Router();
const auth = require("../middleware/authentication");
const su = require("../middleware/admin");
const validator = require("../middleware/validator");
const idValidator = require("../middleware/idValidator");
const valid = require("../middleware/valid");
const controller = require("../controllers/cars");

// Route GET on /
router.get("/", [auth, su, validator], controller.get);

// Route GET on /by/vin/:vin
router.get("/by/vin/:vin", [auth], controller.getByVIN);

// Route GET on /:id
router.get("/:id", [auth, su, idValidator], controller.getById);

// Route PUT on /:id
router.put('/:id', [auth, su, idValidator, valid(validate)], controller.put);

// Route DELETE on /:id
router.delete("/:id", [auth, su, idValidator], controller.delete);

module.exports = router;