const {Zip} = require("../../../models/zips");
const {State} = require("../../../models/states");
const {City} = require("../../../models/cities");
const request = require("supertest");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/zips", () => {
  /**
   * Test cases for /api/zips endpoint
   */

  let user, token, state, city, zip, url, data;
  const dataTypes = [0, null, false, undefined, ""];

  beforeAll(async done => {
    /**
     * Before all tests create: state, city, and user, generate auth token
     */
    user = await utils.createUser("john.doe@zips.test", true);
    token = await user.generateAuthToken();
    state = await new State({name: "texas", abbreviation: "TX"}).save();
    city = await new City({name: "austin", state: state._id}).save();

    done();
  });

  afterAll(async done => {
    /**
     * After all tests remove: the city, the state, and the user
     */
    await city.remove();
    await state.remove();
    await user.remove();
    done();
  });

  describe("GET /:id", () => {

    // Prepare and return GET request on url (Promise)
    const prepare = () => request(server).get(url).set("x-auth-token", token);

    beforeAll(async done => {
      /**
       * Before all tests define data and create a zip
       * @type {{_id: number, city: string, state: string, pop: number, loc: number[]}}
       */

      data = {
        _id: 78701,
        city: city._id,
        state: state._id,
        pop: 3857,
        loc : [ -97.742559, 30.271289 ]};
      zip = await new Zip(data).save();
      done();
    });

    afterAll(async done => {
      /**
       * After all tests remove the zip
       */

      await zip.remove();
      done();
    });

    it("should return status code 404 if zip invalid", async done => {

      url = "/api/zips/wrongZip";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if zip doesn't exist", async done => {

      url = "/api/zips/00000";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and zip if zip code is valid", async done => {

      url = `/api/zips/${zip._id}`;

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", zip._id);
      expect(res.body).toHaveProperty("city", String(zip.city));
      expect(res.body).toHaveProperty("state", String(zip.state));
      expect(res.body).toHaveProperty("loc");
      expect(res.body.loc.length === 2).toBeTruthy();
      expect(res.body).toHaveProperty("pop", zip.pop);
      done();
    });
  });

  describe("POST /", () => {

    let postData;

    // Prepare and return POST request on url with auth token (Promise)
    const prepare = () => request(server).post(url).set("x-auth-token", token).send(postData);

    beforeEach(async done => {
      /**
       * Before each test define post data and url
       * @type {{_id: number, city: string, state: string, pop: number, loc: number[]}}
       */

      postData = {
        _id: 78701,
        city: city.name,
        state: state.name,
        pop: 3857,
        loc : [ -97.742559, 30.271289 ]};
      url = "/api/zips";
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the zip
       */

      await Zip.findByIdAndRemove(data._id);
      done();
    });

    it("should return status code 400 if post data doesn't have loc", async done => {

      delete postData.loc;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if post data loc have more than 2 coordinates", async done => {

      postData.loc.push(100.001);

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if post data loc have less than 2 coordinates", async done => {

      postData.loc.pop();

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 401 if user isn't logged in", async done => {

      const res = await request(server).post(url).send(postData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 403 if user isn't admin", async done => {

      user.su = false;
      await user.save();
      const _token = await user.generateAuthToken();
      const res = await request(server).post(url).set("x-auth-token", _token).send(postData);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      user.su = true;
      await user.save();

      done();
    });

    it("should return status code 400 if post data loc coordinates isn't integers", async done => {

      dataTypes.forEach(async item => {

        postData.loc[0] = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");

        postData.loc[1] = item;

        const res2 = await prepare();

        expect(res2.status).toBe(400);
        expect(res2.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 400 if post data doesn't have pop", async done => {

      delete postData.pop;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if population is invalid", async done => {

      dataTypes.forEach(async item => {
        if (item !== 0) {
          postData.pop = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it("should return status code 404 if state doesn't exist", async done => {

      postData.state = "fakeState";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if city doesn't exist", async done => {

      postData.city = "fakeCity";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if post data doesn't include a city name", async done => {

      delete postData.city;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if post data doesn't include a state name", async done => {

      delete postData.state;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 and zip info if post data is valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", postData._id);
      expect(res.body).toHaveProperty("city", String(city._id));
      expect(res.body).toHaveProperty("state", String(state._id));
      expect(res.body).toHaveProperty("pop", postData.pop);
      expect(res.body).toHaveProperty("loc");
      expect(res.body.loc.length === 2).toBeTruthy();
      expect(res.body.loc[0] === postData.loc[0]).toBeTruthy();
      expect(res.body.loc[1] === postData.loc[1]).toBeTruthy();

      done();
    });
  });
});
