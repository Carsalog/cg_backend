const {Model} = require("../../../models/models");
const {Make} = require("../../../models/makes");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/models", () => {
  /**
   * Tests suit for model router
   */
  
  let user, token, make, model, name, url;
  const dataTypes = [0, null, false, undefined, ""];
  
  beforeAll(async done => {

    user = await utils.createUser("john.doe@models.test", true);
    token = await user.generateAuthToken();
    make = await Make({name: "Make1"}).save();
    
    done();
  });

  afterAll(async done => {

    await user.remove();
    await make.remove();
    await done();
  });

});