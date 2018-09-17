const {Zip} = require("../../../models/zips");
const {State} = require("../../../models/states");
const {City} = require("../../../models/cities");
const request = require("supertest");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/zips", () => {
  /**
   * Test cases for /api/zips endpoint
   */

  let user, token, state, city, zip, url, data;
  const dataTypes = [0, null, false, undefined, ""];

  beforeAll(async done => {
    /**
     * Before all tests create: state, city, and user, generate auth token
     */
    user = await utils.createUser("john.doe@zips.test", true);
    token = await user.generateAuthToken();
    state = await new State({name: "texas", abbreviation: "TX"}).save();
    city = await new City({name: "austin", state: state._id}).save();

    done();
  });

  afterAll(async done => {
    /**
     * After all tests remove: the city, the state, and the user
     */
    await city.remove();
    await state.remove();
    await user.remove();
    done();
  });
});
