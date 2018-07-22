const request = require("supertest");
const {User} = require("../../../models/users");
const bcrypt = require("bcrypt");
const config = require("config");
const mongoose = require("mongoose");


describe("/api/users", () => {

  let server;
  let token;
  let user;
  let usr;
  let _usr;
  let url;
  const dataTypes = [0, 1, false, null, undefined, ""];

  const createUser = async function () {
    /**
     * Create a user in db and return promise
     *
     * @return Promise:
     */
    const _user = User({
      firstName: usr.firstName,
      lastName: usr.lastName,
      email: usr.email,
      phone: usr.phone,
      password: await bcrypt.hash(usr.password, await bcrypt.genSalt(config.get("bcrypt.hashRounds"))),
      su: false
    });
    return await _user.save();
  };

  beforeEach(async (done) => {
    /**
     * Before each test group, run server
     */
    server = require("../../../index");
    done();
  });

  afterEach(async (done) => {
    /**
     * After each test group shut down the server
     */
    await server.close();
    done();
  });

  describe("GET /me", () => {

    beforeEach(async (done) => {
      /**
       * Before each test create a new user, and generate a new auth token
       * @type {{firstName: string, lastName: string, email: string, phone: string, password: string}}
       */
      usr = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@gmail.com",
        phone: "12345678",
        password: "12345678Ab"
      };
      user = await createUser();
      token = await user.generateAuthToken();
      done();
    });

    afterEach(async (done) => {
      /**
       * After each test remove all user objects
       */
      await User.remove({});
      done();
    });

    it("should return status code 401 if user is note logged in", async (done) => {

      const res = await request(server).get("/api/users/me");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return user object", async (done) => {

      const res = await request(server).get("/api/users/me").set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.firstName).toBe(usr.firstName);
      expect(res.body.lastName).toBe(usr.lastName);
      expect(res.body.email).toBe(usr.email);
      expect(res.body.phone).toBe(usr.phone);
      expect(res.body.su).toBe(false);

      done();
    });
  });
});