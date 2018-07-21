const bcrypt = require("bcrypt");
const config = require("config");

async function getHash(password) {
  /**
   * Hashing user password
   *
   * @return Promise:
   */
  return bcrypt.hash(password, await bcrypt.genSalt(config.get("bcrypt.hashRounds")));
}

async function passwordVerification(password, hash) {
  /**
   * User password verification
   *
   * @param password: String - row user password
   * @param hash: String - Hashed password from db
   * @return Promise:
   */
  return bcrypt.compare(password, hash);
}

exports.hash = getHash;
exports.verify = passwordVerification;