const {Make} = require("../../../models/makes");
const {User} = require("../../../models/users");
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("config");
const server = require("../../../loader");


describe("/api/makes", () => {

  let user;
  let token;
  let usr;
  let su;
  let makes;
  let make;
  let name;
  let url;

  const createUser = async function () {
    /**
     * Creates user and returns a promise
     * @type {User}
     * @return Promise:
     */
    const _user = new User({
      firstName: usr.firstName,
      lastName: usr.lastName,
      email: usr.email,
      phone: usr.phone,
      password: await bcrypt.hash(usr.password, await bcrypt.genSalt(config.get("bcrypt.hashRounds"))),
      su: su
    });
    return _user.save();
  };

  beforeEach(async (done) => {
    /**
     * Before each test defines user object creates user, and generate auth token
     * @type {{firstName: string, lastName: string, email: string, phone: string, password: string}}
     */
    usr = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@makes.test",
      phone: "12345678",
      password: "12345678Ab",
    };
    su = true;
    user = await createUser();
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {
    /**
     * After each test remove user
     */
    await user.remove();
    await done();
  });

  describe("GET /", () => {

    beforeEach(async (done) => {
      makes = [
        {name: "BMW"},
        {name: "Toyota"},
        {name: "Mitsubishi"}
      ];
      await Make.collection.insertMany(makes);
      done();
    });

    afterEach(async () => {
      await Make.deleteMany({name: {$in: ["BMW", "Toyota", "Mitsubishi"]}});
    });

    it("should return status code 200 when GET parameters is not defined", async () => {
      const res = await request(server).get("/api/makes");

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();
    });

    it("should return only 2 makes when GET parameter amount is 2", async () => {
      const res = await request(server).get("/api/makes?page=1&amount=2");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });

  describe("GET /:id", () => {

    beforeEach(async (done) => {
      name = "Hyundai";
      make = Make({name});
      await make.save();
      done();
    });

    afterEach(async (done) => {
      await make.remove();
      done();
    });

    it("should return status code 404 if make does not exist", async (done) => {

      const res = await request(server).get(`/api/makes/${mongoose.Types.ObjectId().toHexString()}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and name of the make", async (done) => {

      const res = await request(server).get(`/api/makes/${make._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", make.name);
      done();
    });
  });

  describe("POST /", () => {

    const prepare = () => {
      return request(server)
        .post("/api/makes")
        .set("x-auth-token", token)
        .send({name});
    };

    beforeEach(async (done) => {

      done();
    });

    afterEach(async (done) => {
      await Make.remove({name});
      done();
    });

    it("should return status code 400 if server does not get any data", async (done) => {

      const res = await request(server).post("/api/makes").set("x-auth-token", token);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if make name is null", async (done) => {
      name = null;
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if make name is undefined", async (done) => {

      name = undefined;
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if make name is false", async (done) => {

      name = false;
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if make name is an empty string", async (done) => {

      name = "";
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it(`should return status code 400 if make name length is less than ${config.get("makes.name.min")} characters`, async (done) => {

      name = Array(config.get("makes.name.min")).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it(`should return 400 if make name length is more than ${config.get("makes.name.max")} characters`, async (done) => {

      name = Array(config.get("makes.name.max") + 2).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 and make object if make already exists", async (done) => {

      name = "Dodge";
      await prepare();
      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);

      done();
    });

    it("should return status code 201 if make is valid", async (done) => {

      name = "Dodge";
      const res = await prepare();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);

      done();
    });
  });

  describe("PUT /:id", () => {

    const prepare = () => {
      return request(server)
        .put(url)
        .set("x-auth-token", token)
        .send({name});
    };

    beforeEach(async (done) => {

      make = Make({name: "Dodge"});
      await make.save();
      url = `/api/makes/${make._id}`;
      done();
    });

    afterEach(async (done) => {
      await make.remove();
      done();
    });

    it("should return status code 404 if make id is invalid", async (done) => {
      name = "new Name";
      url = "/api/makes/1";
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

    it("should return status code 400 if make name is null", async (done) => {

      name = null;
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if make name is false", async (done) => {
      name = false;
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if make name is undefined", async (done) => {
      name = undefined;
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if make name is an empty string", async (done) => {
      name = "";
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return status code 400 if make name is less than ${config.get("makes.name.min")} characters`, async (done) => {
      name = Array(config.get("makes.name.min")).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return status code 400 if make name is more than ${config.get("makes.name.max")} characters`, async (done) => {
      name = Array(config.get("makes.name.max") + 2).join("a");
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it(`should return updated make object and status code 200 if make name is valid`, async (done) => {
      name = "Honda";
      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      done();
    });
  });

  describe("DELETE /:id", () => {

    const prepare = () => {
      return request(server).delete(url).set("x-auth-token", token);
    };

    beforeEach(async (done) => {
      name = "Dodge";
      make = Make({name});
      await make.save();
      url = `/api/makes/${make._id}`;
      done();
    });

    afterEach(async (done) => {

      await make.remove();
      done();
    });

    it("should return status code 404 if make id is invalid", async (done) => {
      url = "/api/makes/1";
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if make id is valid but not exist", async (done) => {

      url = `/api/makes/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and info message if make id exists", async (done) => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("info");

      done();
    });
  });
});