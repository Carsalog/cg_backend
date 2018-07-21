const {hash, verify} = require("../../../lib/hash");
const bcrypt = require("bcrypt");
const config = require("config");

const password = "Password1!";

describe("hash module", () => {

  it("should return a valid password hash", async () => {
    const hashed = await hash(password);
    const result = await bcrypt.compare(password, hashed);
    expect(result).toBe(true);
  });

  it("should return true when password is valid", async () => {
    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(config.get("bcrypt.hashRounds")));
    const result = await verify(password, hashed);
    expect(result).toBe(true); ``
  });
});