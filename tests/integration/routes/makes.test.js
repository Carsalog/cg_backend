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
});