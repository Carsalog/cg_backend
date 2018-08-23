const {Transmission} = require("../../../models/transmission");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/transmissions", () => {

  let user;
  let token;
  let transmission;
  let type;
  let url;
  const dataTypes = [0, null, false, undefined, ""];


  beforeEach(async (done) => {

    user = await utils.createUser("john.doe@transmission.test", true);
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {

    await user.remove();
    await done();
  });

});