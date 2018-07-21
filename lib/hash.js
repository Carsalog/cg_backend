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

exports.hash = getHash;