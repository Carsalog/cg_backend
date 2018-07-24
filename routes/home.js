const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const context = {};
  return res.render('index', context)
});

router.get("*", (req, res) => {
  /**
   * Returns error message with status code 404 if GET method with given url is undefined
   */
  return res.status(404).send({error: "Cannot find this page"})
});

module.exports = router;