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
});