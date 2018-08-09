const {State} = require("../../../models/states");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/states", () => {

  let user;
  let token;
  let states;
  let state;
  let name;
  let abbreviation;
  let url;
  const dataTypes = [0, null, false, undefined, ""];

  beforeEach(async (done) => {

    user = await utils.createUser("john.doe@states.test", true);
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {

    await user.remove();
    done();
  });

});
