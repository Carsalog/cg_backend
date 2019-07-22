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

router.post("*", (req, res) => {
  /**
   * Returns error message with status code 404 if POST method with given url is undefined
   */
  return res.status(404).send({error: "Cannot create anything with given url"})
});

router.put("*", (req, res) => {
  /**
   * Returns error message with status code 404 if PUT method with given url is undefined
   */
  return res.status(404).send({error: "Cannot update anything with given url"})
});

router.delete("*", (req, res) => {
  /**
   * Returns error message with status code 404 if DELETE method with given url is undefined
   */
  return res.status(404).send({error: "Cannot delete anything with given url"})
});

router.all("*", (req, res) => {
  /**
   * Returns error message with status code 400 if server doesn't support query method
   */
  return res.status(400).send({error: `Server doesn't support ${req.method} queries`})
});

module.exports = router;