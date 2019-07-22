const {User} = require("../../../models/users");
const bcrypt = require("bcrypt");
const config = require("config");
const {Car} = require("../../../models/cars");
const mongoose = require("mongoose");

module.exports.createUser = async function (email, su) {
  /**
   * Creates user and returns a promise
   * @type {User}
   * @return Promise:
   */

  return User({
    firstName: "John",
    lastName: "Doe",
    email: email,
    phone: "12345678",
    password: await bcrypt.hash("12345678Ab", await bcrypt.genSalt(config.get("bcrypt.hashRounds"))),
    su: su
  }).save();
};

module.exports.getUser = email => User.getByEmail(email);

module.exports.createCar = vin => Car({
  vin,
  make: "BMW",
  model: "528i",
  year: 2015,
  fuel: "gasoline",
  type: "sedan"
}).save();

// Return random id
module.exports.getRandomId = () => mongoose.Types.ObjectId().toHexString();

module.exports.getRandomToken = () => User({"_id": mongoose.Types.ObjectId().toHexString()}).generateAuthToken();
