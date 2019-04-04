const {State} = require("../../../models/states");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/states", () => {
  /**
   * Tests for /api/states
   */
  let user;
  let token;
  let states;
  let state;
  let name;
  let abbreviation;
  let url;
  const dataTypes = [0, null, false, undefined, ""];

  beforeEach(async (done) => {
    /**
     * Before each test create user and generate a new token
     */
    user = await utils.createUser("john.doe@states.test", true);
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {
    /**
     * After each test remove the user
     */
    await user.remove();
    done();
  });

  describe("GET /", () => {
    /**
     * Test cases for GET on /api/states
     */

    beforeEach(async (done) => {
      /**
       * Before each test create states
       * @type {*[]}
       */
      states = [
        {name: "states_test_name_one", abbreviation: "SO"},
        {name: "states_test_name_two", abbreviation: "ST"},
        {name: "states_test_name_three", abbreviation: "SR"}
      ];
      await State.collection.insertMany(states);
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the states
       */
      await State.deleteMany({
        name: {
          $in: [
            "states_test_name_one",
            "states_test_name_two",
            "states_test_name_three"]
        }
      });
      done();
    });

    it("should return status code 200 and list of states if GET parameters isn't given", async (done) => {

      const res = await request(server).get("/api/states");

      expect(res.status).toBe(200);
      expect(res.body.length >= states.length).toBeTruthy();
      done();
    });

    it("should return only 2 states when GET parameter amount is 2", async (done) => {

      const amount = 2;
      const res = await request(server).get(`/api/states?page=1&amount=${amount}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(amount);
      done();
    });
  });

  describe("GET /:id", () => {
    /**
     * Test cases for GET on /api/states/:id
     */

    beforeEach(async (done) => {
      /**
       * Before each test define name, create state
       * @type {string}
       */
      name = "TEST state one";
      state = await State({name: name, abbreviation: "ST"}).save();
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the state
       */
      await state.remove();
      done();
    });

    it("should return status code 404 if state does not exist", async (done) => {

      const res = await request(server).get(`/api/states/${mongoose.Types.ObjectId().toHexString()}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and state object if state exists", async (done) => {

      const res = await request(server).get(`/api/states/${state._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", state.name);
      expect(res.body).toHaveProperty("abbreviation", state.abbreviation);
      done();
    });

  });

  describe("POST /", () => {
    /**
     * Test cases for POST on /api/states
     */
    const prepare = () => {
      /**
       * Create a POST request
       * @return Promise:
       */
      return request(server)
        .post("/api/states")
        .set("x-auth-token", token)
        .send({name: name, abbreviation: abbreviation});
    };

    beforeEach(async (done) => {
      /**
       * Before each test define name and abbreviation
       * @type {string}
       */
      name = "states_test_name";
      abbreviation = "ST";
      done();
    });

    afterEach(async (done) => {
      /**
       * Remote the state
       */
      await State.remove({name});
      done();
    });

    it("should return status code 400 if server does not get any data", async (done) => {

      const res = await request(server).post("/api/states").set("x-auth-token", token);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if state name is invalid", async (done) => {

      dataTypes.forEach(async type => {

        name = type;
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it("should return status code 400 if state abbreviation is invalid", async (done) => {

      dataTypes.forEach(async type => {

        abbreviation = type;
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it(`should return 400 if state name length is less than ${config.get("states.name.min")} characters`, async (done) => {

      name = Array(config.get("states.name.min")).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return 400 if state name length is more than ${config.get("states.name.max")} characters`, async (done) => {

      name = Array(config.get("states.name.max") + 2).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return 400 if state abbreviation length is less than ${config.get("states.abbreviation.min")} characters`,
      async (done) => {

        abbreviation = Array(config.get("states.abbreviation.min")).join("a");
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        done();
      }
    );

    it(`should return 400 if state abbreviation length is more than ${config.get("states.abbreviation.max")} characters`,
      async (done) => {

        abbreviation = Array(config.get("states.abbreviation.max") + 2).join("a");
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        done();
      }
    );

    it("should return status code 200 and state object if state already exists", async (done) => {

      await State({name: name, abbreviation: abbreviation}).save();
      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("abbreviation", abbreviation);
      done();
    });

    it("should return status code 201 if state is valid and it doesn't exist", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      done();
    });
  });

  describe("PUT /:id", () => {
    /**
     * Test cases for PUT on /api/states/:id
     */
    const prepare = () => {
      /**
       * Return PUT request object
       * @return Promise:
       */
      return request(server)
        .put(url)
        .set("x-auth-token", token)
        .send({name: name, abbreviation: abbreviation});
    };

    beforeEach(async (done) => {
      /**
       * Before each test:
       *    define: name and abbreviation
       *    create: a new state
       *    generate: url
       * @type {string}
       */
      name = "newname";
      abbreviation = "NN";

      state = await State({name: "states_test_name", abbreviation: "ST"}).save();

      url = `/api/states/${state._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each request remove the state
       */
      await state.remove();
      done();
    });

    it("should return status code 404 if state id is invalid", async (done) => {

      url = "/api/states/1";
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if state doesn't exist", async (done) => {

      url = `/api/states/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if request has no data", async (done) => {

      const res = await request(server).put(url).set("x-auth-token", token);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if state name is invalid", async (done) => {

      dataTypes.forEach(async type => {

        name = type;
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it("should return status code 400 if state abbreviation is invalid", async (done) => {

      dataTypes.forEach(async type => {

        abbreviation = type;
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it(`should return status code 400 if state name is less than ${config.get("states.name.min")} characters`,
      async (done) => {

        name = Array(config.get("states.name.min")).join("a");
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        done();
      });

    it(`should return status code 400 if state name is more than ${config.get("states.name.max")} characters`,
      async (done) => {

        name = Array(config.get("states.name.max") + 2).join("a");
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        done();
      });

    it(`should return status code 400 if state abbreviation is less than ${config.get("states.abbreviation.min")} characters`,
      async (done) => {

        abbreviation = Array(config.get("states.abbreviation.min")).join("a");
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        done();
      });

    it(`should return status code 400 if state abbreviation is more than ${config.get("states.abbreviation.max")} characters`,
      async (done) => {

        abbreviation = Array(config.get("states.abbreviation.max") + 2).join("a");
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        done();
      });

    it(`should return updated state object and status code 200 if state data is valid`, async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("abbreviation", abbreviation);
      done();
    });
  });

  describe("DELETE /:id", () => {
    /**
     * Test cases for DELETE on /api/states/:id
     */

    const prepare = () => {
      /**
       * Return DELETE request object
       * @return Promise:
       */
      return request(server).delete(url).set("x-auth-token", token);
    };

    beforeEach(async (done) => {
      /**
       * Before each test:
       *   define: name and abbreviation,
       *   create: a new state
       *   generate: url
       * @type {string}
       */
      name = "states_test_name";
      abbreviation = "ST";

      state = await State({name, abbreviation}).save();

      url = `/api/states/${state._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the state
       */
      await state.remove();
      done();
    });

    it("should return status code 404 if state id is invalid", async (done) => {

      url = "/api/states/1";
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if state id is valid but not exist", async (done) => {

      url = `/api/states/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and info message if state id exists", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("info");

      done();
    });
  });
});
