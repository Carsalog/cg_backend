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

});