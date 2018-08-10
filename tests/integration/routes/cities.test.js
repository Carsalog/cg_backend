const {City} = require("../../../models/cities");
const {State} = require("../../../models/states");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/cities", () => {

  let user;
  let token;
  let state;
  let city;
  let name;
  let url;
  const dataTypes = [0, null, false, undefined, ""];

  beforeEach(async (done) => {

    user = await utils.createUser("john.doe@cities.test", true);
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {

    await user.remove();
    await done();
  });

});