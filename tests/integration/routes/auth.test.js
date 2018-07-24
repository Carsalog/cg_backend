const request = require("supertest");
const {User} = require("../../../models/users");
const bcrypt = require("bcrypt");
const config = require("config");
const server = require("../../../loader");


describe("/api/auth", () => {

  let user;
  let usr;
  let credentials;
  const dataTypes = [0, false, null, undefined, ""];

  const createUser = async function () {
    /**
     * Create a new user object and return promise
     *
     * @type {User}
     * @return Promise:
     */
    const _user = new User({
      firstName: usr.firstName,
      lastName: usr.lastName,
      email: usr.email,
      phone: usr.phone,
      password: await bcrypt.hash(usr.password, await bcrypt.genSalt(config.get("bcrypt.hashRounds"))),
      su: false
    });
    return _user.save();
  };

  beforeEach(async (done) => {
    /**
     * Before each test define user object and user credentials, create user
     * @type {{firstName: string, lastName: string, email: string, phone: string, password: string}}
     */
    usr = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@auth.test",
      phone: "12345678",
      password: "12345678Ab",
    };
    user = await createUser();
    credentials = {email: "john.doe@auth.test", password: "12345678Ab"};
    done();
  });

  afterEach(async (done) => {
    /**
     * After each test remove user
     */
    await user.remove();
    done();
  });

  describe("POST /", () => {

    it("should return 400 if credentials is undefined", async (done) => {

      const res = await request(server).post("/api/auth");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return 400 if user email have invalid format", async (done) => {

      for (let i = 0; i < dataTypes.length; i++) {
        credentials.email = dataTypes[i];
        const res = await request(server).post("/api/auth").send(credentials);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      }

      done();
    });

    it("should return 400 if user password have invalid format", async (done) => {

      for (let i = 0; i < dataTypes.length; i++) {
        credentials.password = dataTypes[i];
        const res = await request(server).post("/api/auth").send(credentials);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      }

      done();
    });

    it("should return 400 if user email is invalid", async (done) => {
      credentials.email = "foo@baz.com";
      const res = await request(server).post("/api/auth").send(credentials);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return 400 if user password is invalid", async (done) => {
      credentials.password = "0987654321Ab";
      const res = await request(server).post("/api/auth").send(credentials);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return 200 if user credentials is valid", async (done) => {

      const res = await request(server).post("/api/auth").send(credentials);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      done();
    });
  });
});