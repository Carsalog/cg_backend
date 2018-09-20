const {Model} = require("../../../models/models");
const {Make} = require("../../../models/makes");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/models", () => {
  /**
   * Tests suit for model router
   */
  
  let user, token, make, model, name, url;
  const dataTypes = [0, null, false, undefined, ""];
  
  beforeAll(async done => {
    /**
     * Before all tests create make, user and generate auth token
     */

    user = await utils.createUser("john.doe@models.test", true);
    token = await user.generateAuthToken();
    make = await Make({name: "Make1"}).save();
    
    done();
  });

  afterAll(async done => {
    /**
     * After all tests remove user, make
     */

    await user.remove();
    await make.remove();
    await done();
  });

  describe("GET /by/make/:id", () => {

    let x3, x4;

    // Prepare and return GET request on url (Promise)
    const prepare = () => request(server).get(url);

    beforeEach(async done => {
      /**
       * Before each test create 2 models and define url
       */

      x3 = await Model({name: "x3", make: make._id}).save();
      x4 = await Model({name: "x4", make: make._id}).save();

      url = `/api/models/by/make/${make._id}`;

      make.models.push(x3);
      make.models.push(x4);
      await make.save();
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the models
       */

      await x3.remove();
      await x4.remove();
      done();
    });

    it("should return status code 404 if pass invalid make id", async done => {

      url = `/api/models/by/make/1`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if make id doesn't exist", async done => {

      url = `/api/models/by/make/${utils.getRandomId()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 and list of models", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 2).toBeTruthy();

      done();
    });
  });

});