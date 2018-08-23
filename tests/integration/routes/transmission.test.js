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

    let transmission1;
    let transmission2;

    const prepare = () => {

      return request(server).get(url);
    };

    beforeEach(async (done) => {

      transmission1 = await Transmission({type: "tm01"}).save();
      transmission2 = await Transmission({type: "tm02"}).save();
      url = "/api/transmissions";
      done();
    });

    afterEach(async (done) => {

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

});