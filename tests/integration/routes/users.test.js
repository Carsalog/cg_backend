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
    await server.close();
    done();
  });

});