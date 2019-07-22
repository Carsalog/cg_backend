const {User} = require("../../../models/users");
const auth = require("../../../middleware/authentication");
const mongoose = require("mongoose");
const _ = require("lodash");

describe("auth middleware", () => {
  it("should populate req.user with the payload a valid JWT", () => {
    const user = {_id: mongoose.Types.ObjectId().toHexString(), su: true};
    const token = new User(user).generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token)
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(_.pick(req.user, ["_id", "su"])).toMatchObject(user);
  });
});