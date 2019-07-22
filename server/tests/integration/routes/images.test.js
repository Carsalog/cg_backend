const {Image} = require("../../../models/images");
const {Car} = require("../../../models/cars");
const request = require("supertest");
const mongoose = require("mongoose");
const config = require("config");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/images", () => {

  let user;
  let token;
  let images;
  let name;
  let url;

  beforeEach(async (done) => {
    /**
     * Before each test defines user object creates user, and generate auth token
     * @type {{firstName: string, lastName: string, email: string, phone: string, password: string}}
     */

    user = await utils.createUser("john.doe@images.test", true);
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

  describe("GET /by/car/:id", () => {

    beforeEach(async done => {

      done();
    });

    afterEach(async done => {

      done();
    });

    it("", async done => {

      done();
    });

  });

});