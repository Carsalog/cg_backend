const {User} = require("../../../models/users");
const bcrypt = require("bcrypt");
const config = require("config");

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

