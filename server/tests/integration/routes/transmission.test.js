const {Transmission} = require("../../../models/transmission");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/transmissions", () => {
  /**
   * Tests for /api/transmissions
   */

  let user;
  let token;
  let transmission;
  let type;
  let url;
  const dataTypes = [0, null, false, undefined, ""];


  beforeEach(async (done) => {
    /**
     * Before each test create a new user and generate token
     */

    user = await utils.createUser("john.doe@transmission.test", true);
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

  describe("GET /", () => {
    /**
     * Test for GET on /api/transmissions
     */

    let transmission1;
    let transmission2;

    const prepare = () => {
      /**
       * Return GET request
       * @return Promise:
       */
      return request(server).get(url);
    };

    beforeEach(async (done) => {
      /**
       * Before each test create transmissions and define url
       */

      transmission1 = await Transmission({type: "tm01"}).save();
      transmission2 = await Transmission({type: "tm02"}).save();
      url = "/api/transmissions";
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the transmissions
       */

      await transmission1.remove();
      await transmission2.remove();
      done();
    });

    it("should return list of transmissions and status code 200", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 2).toBeTruthy();
      done();
    });
  });

  describe("GET /:id", () => {
    /**
     * Tests for GET on /api/transmissions/:id
     */

    const prepare = () => {
      /**
       * Return GET request
       * @return Promise:
       */
      return request(server).get(url);
    };

    beforeEach(async (done) => {
      /**
       * Before each test create a transmission and define type and url
       * @type {string}
       */

      type = "type";
      transmission = await Transmission({type}).save();
      url = `/api/transmissions/${transmission._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the transmission
       */

      await transmission.remove();
      done();
    });

    it("should return status code 404 if transmission id is invalid", async done => {

      url = "/api/transmissions/1";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if transmission id does not exist", async (done) => {

      url = `/api/transmissions/${mongoose.Types.ObjectId().toHexString()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and type object if type id is valid", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("type", type);
      done();
    });
  });

  describe("POST /", () => {
    /**
     * Tests for POST on /api/transmissions
     * @return Promise:
     */

    const prepare = () => {
      /**
       * Return POST request
       * @return Promise:
       */

      return request(server).post(url).set("x-auth-token", token).send({type});
    };

    beforeEach(async (done) => {
      /**
       * Before each test define type and url
       * @type {string}
       */

      type = "type";
      url = "/api/transmissions";
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove a transmission
       */

      await Transmission.remove({type});
      done();
    });

    it("should return status code 401 if user doesn't logged in", async (done) => {

      const res = await request(server).post(url).send({name});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if transmission type is invalid", async (done) => {

      dataTypes.forEach(async data => {
        type = data;
        const res = await prepare();
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it(`should return 400 if transmission type is less than ${config.get("transmission.type.min")} characters`,

      async (done) => {

        type = Array(config.get("transmission.type.min")).join("a");
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
        done();
    });

    it(`should return 400 if transmission type is more than ${config.get("transmission.type.max")} characters`, async (done) => {

      type = Array(config.get("transmission.type.max") + 2).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and transmission object if transmission type already exists", async (done) => {

      await Transmission({type}).save();

      const res = await prepare();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("type", type);

      done();
    });

    it("should return status code 201 and transmission object if transmission type is valid", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("type", type);

      done();
    });
  });

  describe("PUT /:id", () => {
    /**
     * Tests for PUT on /api/transmissions/:id
     */

    const prepare = () => {
      /**
       * Return PUT request
       * @return Promise:
       */

      return request(server).put(url).set("x-auth-token", token).send({type});
    };

    beforeEach(async (done) => {
      /**
       * Before each test create a transmission and define type and url
       * @type {string}
       */

      type = "new type";
      transmission = await Transmission({type: "type"}).save();

      url = `/api/transmissions/${transmission._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the transmission
       */

      await transmission.remove();
      done();
    });

    it("should return status code 401 if user doesn't logged in", async (done) => {

      const res = await request(server).put(url).send({name});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 403 if user is not admin", async (done) => {

      user.su = false;
      await user.save();
      const __token = user.generateAuthToken();

      const res = await request(server).put(url).set("x-auth-token", __token).send({type});

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      user.su = true;
      await user.save();
      done();
    });

    it("should return status code 404 if user transmissions id is invalid", async (done) => {

      url = "/api/transmissions/1";
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if user transmission id doesn't exist", async (done) => {

      url = `/api/transmissions/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if transmission type is invalid", async (done) => {

      dataTypes.forEach(async data => {
        type = data;
        const res = await prepare();
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it(`should return status code 400 if transmission type is less then ${config.get("transmission.type.min")}`, async (done) => {

      type = Array(config.get("transmission.type.min")).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it(`should return status code 400 if transmission type is less then ${config.get("transmission.type.max")}`, async (done) => {

      type = Array(config.get("transmission.type.max") + 2).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 and transmission object if transmission type is valid", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("type", type);

      done();
    });
  });

  describe("DELETE /:id", () => {
    /**
     * Tests for DELETE on /api/transmissions/:id
     */

    const prepare = () => {
      /**
       * Return DELETE request
       * @return Promise:
       */

      return request(server).delete(url).set("x-auth-token", token);
    };

    beforeEach(async (done) => {
      /**
       * Before each test create a transmission and define type, url
       * @type {string}
       */

      type = "type";
      transmission = await Transmission({type}).save();

      url = `/api/transmissions/${transmission._id}`;
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove the transmission
       */

      await transmission.remove();
      done();
    });

    it("should return status code 401 if user doesn't logged in", async (done) => {

      const res = await request(server).delete(url);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 403 if user is not admin", async (done) => {

      user.su = false;
      await user.save();

      const __token = user.generateAuthToken();
      const res = await request(server).delete(url).set("x-auth-token", __token);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      user.su = true;
      await user.save();
      done();
    });

    it("should return status code 404 if transmission id is invalid", async (done) => {

      url = "/api/transmissions/1";
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if transmission id doesn't exist", async (done) => {

      url = `/api/transmissions/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 end info message if transmission id is valid", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("info");
      expect(await Transmission.findOne({type})).toBe(null);

      done();
    });
  });
});
