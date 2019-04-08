const express = require("express");
const {validate, validatePATCH} = require("../models/posts");
const router = express.Router();
const auth = require("../middleware/authentication");
const postsValidator = require("../middleware/postsValidator");
const idValidator = require("../middleware/idValidator");
const checkDataIDs = require("../middleware/checkDataIDs");
const validatePostsUpdate = require("../middleware/validatePostsUpdate");
const valid = require("../middleware/valid");
const controller = require("../controllers/posts");


router.get("/", postsValidator, controller.get);

router.get("/by/user/:id", idValidator, controller.getByUserId);

router.get("/by/tags", controller.getByTags);

router.get("/:id", idValidator, controller.getById);

router.post("/", [auth, valid(validate), checkDataIDs], controller.post);

router.patch('/:id', [auth, idValidator, valid(validatePATCH)], controller.patch);

router.put('/:id', [auth, idValidator, valid(validate), validatePostsUpdate], controller.put);

router.delete("/:id", [auth, idValidator], controller.delete);

module.exports = router;