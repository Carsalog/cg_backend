const bcrypt = require("bcrypt");
const config = require("config");

async function getHash(password) {

  return bcrypt.hash(password, await bcrypt.genSalt(config.get("bcrypt.hashRounds")));
}

exports.hash = getHash;