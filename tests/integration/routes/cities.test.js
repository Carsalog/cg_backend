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

    user = await utils.createUser(`john.doe.${Math.random()}@cities.test`, true);
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
      state = await State({name: "cities_state_test", abbreviation: "ST"}).save();

      city1 = await City({name: "city1_test", state: state._id}).save();
      city2 = await City({name: "city2_test", state: state._id}).save();

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

  describe("GET /:id", () => {
    /**
     * Test cases for CET on /api/cities/:id
     */

    const prepare = () => {
      /**
       * Prepares and returns GET request
       * @return Promise:
       */
      return request(server).get(url);
    };

    beforeEach(async (done) => {
      /**
       * Before each test:
       *    define: name
       *    create: state, and city
       *    generate: url
       * @type {string}
       */
      name = "test_city_one";

      state = await State({name: "cities_state_test", abbreviation: "ST"}).save();
      city = await City({name: name, state: state._id}).save();

      url = `/api/cities/${city._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove state, and city
       */
      await city.remove();
      await state.remove();
      done();
    });

    it("should return status code 404 if city id is invalid", async (done) => {

      url = "/api/cities/1";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if city id does not exist", async (done) => {

      url = `/api/cities/${mongoose.Types.ObjectId().toHexString()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and model object if model id is valid", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("state", String(state._id));

      done();
    });
  });

  describe("POST /", () => {
    /**
     * Test cases for POST on /api/cities
     */

    const prepare = () => {
      /**
       * Prepares and returns POST request
       * @return Promise:
       */
      return request(server).post(url).set("x-auth-token", token).send({name: name, state: state._id});
    };

    beforeEach(async (done) => {
      /**
       * Before each test create state, and define name and url
       */

      state = await State({name: "cities_state_test", abbreviation: "ST"}).save();

      name = "city";
      url = "/api/cities";
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove city and state
       */

      await City.remove({name});
      await state.remove();
      done();
    });

    it("should return status code 401 if user does not logged in", async (done) => {

      const res = await request(server).post(url).send({name:name, state: state._id});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if token is invalid", async (done) => {

      const res = await request(server).post(url).set("x-auth-token", "badToken").send({name:name, state: state._id});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if state id doesn't exist", async (done) => {

      const  fakeId = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).post(url).set("x-auth-token", token).send({name:name, state: fakeId});

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if name is invalid", async (done) => {

      dataTypes.forEach(async type => {

        name = type;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it(`should return status code 400 if name less than ${config.get("cities.name.min")} characters`, async (done) => {

      name = Array(config.get("cities.name.min")).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return status code 400 if name more than ${config.get("cities.name.max")} characters`, async (done) => {

      name = Array(config.get("cities.name.max") + 2).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 if city already exists", async (done) => {

      await City({name: name, state: state._id}).save();
      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("state", String(state._id));
      done();
    });

    it("should return status code 201 and the city object if name is valid", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("state", String(state._id));
      done();
    });
  });

  describe("PUT /:id", () => {
    /**
     * Test cases for PUT on /api/cities/:id
     */

    const prepare = () => {
      /**
       * Prepares and returns PUT request
       * @return Promise:
       */
      return request(server).put(url).set("x-auth-token", token).send({name, state: state._id});
    };

    beforeEach(async (done) => {
      /**
       * Before each test:
       *    define: name
       *    create: state and city
       *    add: city to the state
       *    generate: url
       * @type {string}
       */
      name = "new city";

      state = await State({name: "cities_state_test", abbreviation: "ST"}).save();
      city = await City({name: "model", state: state._id}).save();

      state.cities.push(city._id);
      await state.save();

      url = `/api/cities/${city._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove city and state
       */
      await state.remove();
      await city.remove();
      done();
    });

    it("should return status code 401 if user does not logged in", async (done) => {

      const res = await request(server).put(url).send({name, state: state._id});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 403 if user is not admin", async (done) => {

      user.su = false;
      await user.save();

      const __token = user.generateAuthToken();

      const res = await request(server).put(url).set("x-auth-token", __token).send({name, state: state._id});

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      // Set user privileges
      user.su = true;
      await user.save();
      done();
    });

    it("should return status code 400 if name is invalid", async (done) => {

      dataTypes.forEach(async type => {
        name = type;
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if state id doesn't exist", async (done) => {

      const  fakeId = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).put(url).set("x-auth-token", token).send({name:name, state: fakeId});

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return status code 400 if name less than ${config.get("cities.name.min")} characters`, async (done) => {

      name = Array(config.get("cities.name.min")).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return status code 400 if name more than ${config.get("cities.name.max")} characters`, async (done) => {

      name = Array(config.get("cities.name.max") + 2).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if city id is invalid", async (done) => {

      url = "/api/cities/1";
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if city id doesn't exist", async (done) => {

      url = `/api/cities/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 and city object if name is valid", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("state", String(state._id));

      done();
    });
  });

  describe("DELETE /:id", () => {
    /**
     * Test cases for DELETE on /api/cities/:id
     */

    const prepare = () => {
      /**
       * Prepares and returns DELETE request
       * @return Promise:
       */
      return request(server).delete(url).set("x-auth-token", token)
    };

    beforeEach(async (done) => {
      /**
       * Before each test:
       *    define: name
       *    create: state and city
       *    add: city to the state
       *    generate: url
       * @type {string}
       */

      name = "city";

      state = await State({name: "cities_state_test", abbreviation: "ST"}).save();
      city = await City({name: name, state: state._id}).save();

      state.cities.push(city._id);
      await state.save();

      url = `/api/cities/${city._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove city and state
       */

      if (city) await city.remove();
      if (state) await state.remove();
      done();
    });

    it("should return status code 401 if user does not logged in", async (done) => {

      const res = await request(server).delete(url);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 403 if user is not admin", async (done) => {

      user.su = false;
      await user.save();

      const __token = await user.generateAuthToken();

      const res = await request(server).delete(url).set("x-auth-token", __token);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      user.su = true;
      await user.save();
      done();
    });

    it("should return status code 404 if city id is invalid", async (done) => {

      url = "/api/cities/1";
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if city id does not exist", async (done) => {

      url = `/api/cities/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 and info message if city id is valid", async (done) => {

      const cityId = String(city._id);
      const stateId = String(city.state);

      const res = await prepare();
      state = await State.findById(stateId);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("info");

      // Make sure that city was removed
      expect(await City.findOne({name})).toBe(null);
      expect(state.cities.indexOf(cityId)).toBe(-1);

      done();
    });
  });
});