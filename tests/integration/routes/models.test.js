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

  describe("GET /:id", () => {

    // Prepare and return get request on url (Promise)
    const prepare = () => request(server).get(url);

    beforeEach(async done => {
      /**
       * Before each test create model, define name and url
       */

      model = await Model({name: "model", make: make._id}).save();

      url = `/api/models/${model._id}`;

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove model
       */

      await model.remove();
      done();
    });

    it("should return status code 404 if model id is invalid", async done => {

      url = "/api/models/invalidID";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if model id does not exist", async done => {

      url = `/api/models/${utils.getRandomId()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and model object if model id is valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "model");

      done();
    });
  });

  describe("POST /", () => {

    // Prepare and return POST request on url (Promise)
    const prepare = () => request(server).post(url).set("x-auth-token", token).send({name: name, make: make._id});

    beforeEach(async done => {
      /**
       * Before each test define name and url
       */

      name = "model";
      url = "/api/models";
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the model
       */

      await Model.remove({name});
      done();
    });



    it("should return status code 401 if user does not logged in", async done => {

      const res = await request(server).post(url).send({name:name, make: make._id});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if token is invalid", async done => {

      const res = await request(server).post(url).set("x-auth-token", "badToken").send({name:name, make: make._id});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });


    it("should return status code 404 if make doesn't exist", async done => {

      const res = await request(server)
        .post(url)
        .set("x-auth-token", token)
        .send({name:name, make: utils.getRandomId()});

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if name is invalid", async done => {

      dataTypes.forEach(async item => {

        name = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it(`should return status code 400 if name length less then
        ${config.get("models.name.min")}`, async done => {

      name = Array(config.get("models.name.min")).join("a");

      const res = await prepare();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it(`should return status code 400 if name length more then
        ${config.get("models.name.max")}`, async done => {

      name = Array(config.get("models.name.max") + 2).join("a");

      const res = await prepare();
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 if model already exists", async done => {

      const model = Model({name: name, make: make._id});
      await model.save();

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      done();
    });

    it("should return status code 201 and the model object if name is valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      done();
    });
  });

});