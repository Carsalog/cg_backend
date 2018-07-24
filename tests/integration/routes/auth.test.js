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

  
});