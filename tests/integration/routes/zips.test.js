const {Zip} = require("../../../models/zips");
const {State} = require("../../../models/states");
const {City} = require("../../../models/cities");
const request = require("supertest");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/zips", () => {

  let user, token, state, city, zip, url, data;
  const dataTypes = [0, null, false, undefined, ""];

  beforeAll(async done => {

    user = await utils.createUser("john.doe@zips.test", true);
    token = await user.generateAuthToken();
    state = await new State({name: "texas", abbreviation: "TX"}).save();
    city = await new City({name: "austin", state: state._id}).save();

    done();
  });

  afterAll(async done => {

    await city.remove();
    await state.remove();
    await user.remove();
    done();
  });
});
