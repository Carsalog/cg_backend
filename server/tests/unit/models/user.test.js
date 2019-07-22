const {User} = require("../../../models/users");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

describe("user.generateAuthToken", () => {
  it("should return a valid JWT", () => {
    const uid = mongoose.mongo.ObjectId().toHexString();
    const payload = {
      _id: uid,
      firstName: "John",
      lastName: "Doe",
      phone: "123456789",
      email: "john.doe@gmail.com",
      su: true
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    expect(decoded).toMatchObject(payload)
  });
});