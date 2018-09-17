const {Car, validateVIN} = require("../models/cars");
const nhtsa = require('nhtsa');
const _ = require("lodash");
const controller = {};


controller.get = async (req, res) => {

  res.send(await Car.getByPage(req.params.page, req.params.amount));
};

module.exports = controller;