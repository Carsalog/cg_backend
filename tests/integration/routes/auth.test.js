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

});