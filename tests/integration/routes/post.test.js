const {Post} = require("../../../models/posts");
const {Make} = require("../../../models/makes");
const {Model} = require("../../../models/models");
const {Transmission} = require("../../../models/transmission");
const {State} = require("../../../models/states");
const {City} = require("../../../models/cities");
const request = require("supertest");
const server = require("../../../loader");
const utils = require("./utils");
const {getCurrentYear} = require("../../../lib/tools");
const config = require("config");
const currentYear = getCurrentYear();

describe("/api/posts", () => {
  /**
   * Test cases suit for /api/posts endpoint
   */

  let transmission, make, model, user, token, url, vin, car, state, city, post, badUser, _token;
  const dataTypes = [0, null, false, undefined, ""];
  const createPost = (description, price, mileage) => Post({
    description,
    make: make._id,
    model: model._id,
    transmission: transmission._id,
    state: state._id,
    car: car._id,
    year: car.year,
    city: city._id,
    author: user._id,
    mileage,
    price
  }).save();

  beforeAll(async done => {

    vin = "WBA5A5C55FD520474";

    user = await utils.createUser("john.doe@post.test", true);
    token = await user.generateAuthToken();
    badUser = await utils.createUser("bad.user@post.test", false);
    _token = badUser.generateAuthToken();
    car = await utils.createCar("WBA5A5C51FD520000");
    make = await new Make({name: "BMW"}).save();
    model = await new Model({name: "5 series", make: make._id}).save();
    state = await new State({name: "Texas", abbreviation: "TX"}).save();
    city = await new City({name: "Austin", state: state._id}).save();
    transmission = await new Transmission({type: "automatic"}).save();

    done();
  });

  afterAll(async done => {

    await user.remove();
    await badUser.remove();
    await car.remove();
    await make.remove();
    await model.remove();
    await state.remove();
    await city.remove();
    await transmission.remove();

    done();
  });

});