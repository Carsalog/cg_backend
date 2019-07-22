const {Tag} = require("../../../models/tags");
const {User} = require("../../../models/users");
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const config = require("config");
const server = require("../../../loader");



describe("/api/tags", () => {

  let tag;
  let user;
  let admin;
  let userInfo;
  let name;
  let token;
  let suToken;
  let url;
  let su;
  const dataTypes = [0, false, null, undefined, ""];

  const createUser = async function () {
    const _user = new User({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      phone: userInfo.phone,
      password: await bcrypt.hash(userInfo.password, await bcrypt.genSalt(config.get("bcrypt.hashRounds"))),
      su: su
    });
    return _user.save();
  };


  beforeEach(async (done) => {
    userInfo = {
      firstName: "John",
      lastName: "Doe",
      email: "admin.john.doe@tag.test",
      phone: "12345678",
      password: "12345678Ab"
    };
    su = true;
    admin = await createUser();

    suToken = admin.generateAuthToken();
    userInfo = {
      firstName: "John",
      lastName: "Doe",
      email: "user.john.doe@tag.test",
      phone: "12345678",
      password: "12345678Ab"
    };
    su = false;
    user = await createUser();
    token = await user.generateAuthToken();
    done();
  });

  afterEach(async (done) => {
    await admin.remove();
    await user.remove();
    done();
  });

  describe("GET /:id", () => {

    beforeEach(async (done) => {
      name = "test_tag";
      tag = await Tag({name});
      await tag.save();
      done();
    });

    afterEach(async (done) => {
      await tag.remove();
      done();
    });

    it("should return a tag if valid id is passed with out authorization", async (done) => {


      const res = await request(server).get(`/api/tags/${tag._id}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
      done();
    });

    it("should return status code 404 if tag id is invalid", async (done) => {

      const res = await request(server).get(`/api/tags/1`);

      expect(res.status).toBe(404);
      done();
    });

    it("should return status code 404 if tag id does not exist", async (done) => {
      const id = mongoose.Types.ObjectId().toHexString();
      const res = await request(server).get(`/api/tags/${id}`);

      expect(res.status).toBe(404);
      done();
    });
  });

  describe("POST /", () => {


    beforeEach(() => {
      name = "tag"
    });

    afterEach(async (done) => {
      await Tag.findOne({name}).remove();
      done();
    });

    const prepare = async (defineToken) => {
      return await request(server)
        .post("/api/tags")
        .set("x-auth-token", defineToken)
        .send({ name });
    };

    it("should return 401 if client is not logged in", async (done) => {

      const res = await prepare("");

      expect(res.status).toBe(401);

      done();
    });

    it(`should return status code 400 if tag name less than ${config.get("tags.name.min")} characters`, async (done) => {

      name = Array(config.get("tags.name.min")).join("a");

      const res = await prepare(token);

      expect(res.status).toBe(400);
      done();
    });

    it(`should return 400 if tag name more than ${config.get("tags.name.max")} characters`, async (done) => {

      // Generate long name
      name = Array(config.get("tags.name.max") + 2).join('a');

      const res = await prepare(token);

      expect(res.status).toBe(400);
      done();
    });

    it("should save a tag if tag name is valid", async (done) => {

      await prepare(token);

      const result = Tag.find({name: name});

      expect(result).not.toBeNull();
      done();
    });

    it("should return status code 201 and the tag if tag name is valid", async (done) => {
      const res = await prepare(token);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", name);
      done();
    });

    it("should return status code 200 if tag name exists", async (done) => {
      await prepare(token);
      const res = await prepare(token);

      expect(res.status).toBe(200);
      done();
    });
  });

  describe("PUT /:id", () => {

    beforeEach(async (done) => {
      name = "tag";
      tag = new Tag({name: name});
      await tag.save();
      url = "/api/tags/" + tag._id;
      done();
    });

    afterEach(async (done) => {
      await tag.remove();
      done();
    });

    const prepare = async (defineToken) => {
      return request(server)
        .put(url)
        .set("x-auth-token", defineToken)
        .send({_id: tag._id, name: name});
    };

    it("should return 403 if user not admin", async (done) => {

      const res = await prepare(token);

      expect(res.status).toBe(403);

      done();
    });

    it("should return 404 if tag id doesn't exist", async (done) => {

      url = `/api/tags/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare(suToken);
      expect(res.status).toBe(404);
      done();
    });

    it("should return 400 if data is invalid", async (done) => {

      for(let i = 0; i < dataTypes.length; i++) {
        name = dataTypes[i];
        const res = await prepare(suToken);
        expect(res.status).toBe(400);
      }

      done();
    });

    it("should return 200 if tag is valid", async (done) => {

      const res = await prepare(suToken);
      expect(res.status).toBe(200);
      done();
    });

    it("should update tag name if tag valid", async (done) => {

      await prepare(suToken);

      const updatedTag = await Tag.findById(tag._id);
      expect(updatedTag.name).toBe(name);

      done();
    });
  });

  describe("DELETE /:id", () => {

    beforeEach(async (done) => {
      name = "tag";
      tag = new Tag({name});
      await tag.save();
      url = `/api/tags/${tag._id}`;
      done();
    });

    afterEach(async (done) => {
      await tag.remove();
      done();
    });

    const prepare = async (defineToken) => {
      return request(server)
        .delete(url)
        .set("x-auth-token", defineToken);
    };

    it("should return 403 if user is not admin", async (done) => {
      const res = await prepare(token);
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return 404 if tag id doesn't exist", async (done) => {

      url = `/api/tags/${mongoose.Types.ObjectId().toHexString()}`;
      const res = await prepare(suToken);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 if tag data is valid", async (done) => {

      const res = await prepare(suToken);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("info");
      done();
    });

    it("should remove tag if data is valid", async (done) => {

      await prepare(suToken);
      const removedTag = await Tag.findById(tag._id);
      expect(removedTag).toBe(null);
      done();
    });
  });
});


