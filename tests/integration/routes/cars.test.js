const {Car} = require("../../../models/cars");
const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/cars", () => {
  /**
   * Test cases for /api/cars endpoint
   */

  let fuel, type, make, model, user, token, url, vin, data, year, car;
  const dataTypes = [0, null, false, undefined, ""];

  // Create car with given VIN
  const createCar = vin => Car({vin, make, model, year, fuel, type}).save();

});

