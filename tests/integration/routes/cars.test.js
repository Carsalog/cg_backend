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

  beforeEach(async done => {

    vin = "WBA5A5C51FD520469";
    type = "sedan/saloon";
    make = "BMW";
    model = "528i";
    fuel = "gasoline";
    year = 2015;

    user = await utils.createUser("john.doe@car.test", true);
    token = await user.generateAuthToken();

    done();
  });


});

