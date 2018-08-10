const {City} = require("../../../models/cities");
const {State} = require("../../../models/states");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/cities", () => {
  /**
   * Tests for /api/cities
   */

  let user;
  let token;
  let state;
  let city;
  let name;
  let url;
  const dataTypes = [0, null, false, undefined, ""];

  beforeEach(async (done) => {
    /**
     * Before each test create a user and generate a token
     */

    user = await utils.createUser("john.doe@cities.test", true);
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {
    /**
     * After each test remove the user
     */

    await user.remove();
    await done();
  });

  describe("GET /by/state/:id", () => {
    /**
     * Test cases for GET on /api/cities/by/state/:id
     */

    let city1;
    let city2;
    const prepare = () => {
      /**
       * Prepare and return GET request
       * @return Promise:
       */
      return request(server).get(url);
    };

    beforeEach(async (done) => {
      /**
       * Before each test:
       *    create: state, and cities,
       *    add: cities to state,
       *    generate: url
       */
      state = await State({name: "state1", abbreviation: "ST"}).save();

      city1 = await City({name: "city1", state: state._id}).save();
      city2 = await City({name: "city2", state: state._id}).save();

      state.cities.push(city1._id);
      state.cities.push(city2._id);
      await state.save();

      url = `/api/cities/by/state/${state._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove: state and cities
       */
      await city1.remove();
      await city2.remove();
      await state.remove();
      done();
    });

    it("should return status code 404 if pass invalid state id", async (done) => {

      url = `/api/cities/by/state/1`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if state id doesn't exist", async (done) => {

      url = `/api/cities/by/state/${mongoose.Types.ObjectId().toHexString()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 and list of models", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 2).toBeTruthy();

      done();
    });
  });

});