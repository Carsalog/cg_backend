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

  return bcrypt.compare(password, hash);
}

exports.hash = getHash;
exports.verify = passwordVerification;