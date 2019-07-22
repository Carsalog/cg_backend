const {Zip} = require("../../../models/zips");
const {State} = require("../../../models/states");
const {City} = require("../../../models/cities");
const request = require("supertest");
const server = require("../../../loader");
const utils = require("./utils");

jest.setTimeout(15000);
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
    user = await utils.getUser("john.doe@zips.test");
    if (user) user.remove();
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
        loc: {lat: -97.742559, lng: 30.271289}
      };
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
      expect(res.body).toHaveProperty("city");
      expect(res.body).toHaveProperty("state");
      expect(res.body).toHaveProperty("loc");
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
        loc: {lat: -97.742559, lng: 30.271289}
      };
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

      postData.loc.x = 12;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if post data loc have less than 2 coordinates", async done => {

      delete postData.loc.lat;

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

        postData.loc.lat = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");

        postData.loc.lng = item;

        const res2 = await prepare();

        expect(res2.status).toBe(400);
        expect(res2.body).toHaveProperty("error");
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
      expect(res.body.loc.lat === postData.loc.lat).toBeTruthy();
      expect(res.body.loc.lng === postData.loc.lng).toBeTruthy();

      done();
    });
  });

  describe("PUT /:id", () => {

    let city2, state2;
    const prepare = () => request(server).put(url).set("x-auth-token", token).send(data);

    beforeAll(async done => {
      /**
       * Before all tests create state and city
       */

      state2 = await new State({name: "Washington", abbreviation: "WA"}).save();
      city2 = await new City({name: "seattle", state: state2._id}).save();
      done();
    });

    beforeEach(async done => {
      /**
       * Before each test create a zip, define data and url
       */

      zip = await new Zip({
        _id: 78701,
        city: city2._id,
        state: state2._id,
        loc: {lat: -122.330456, lng: 47.611435}
      }).save();

      data = {
        _id: 78701,
        city: city._id,
        state: state._id,
        loc: {lat: -97.742559, lng: 30.271289}
      };

      url = `/api/zips/${zip._id}`;
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the zip
       */

      await zip.remove();
      done();
    });

    afterAll(async done => {
      /**
       * After all tests remove city and state
       */

      await city2.remove();
      await state2.remove();
      done();
    });

    it("should return status code 401 if user doesn't logged in", async done => {

      const res = await request(server).put(url).send(data);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 403 if user isn't admin", async done => {

      user.su = false;
      await user.save();

      const _token = await user.generateAuthToken();

      const res = await request(server).put(url).set("x-auth-token", _token).send(data);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if zip id is invalid", async done => {

      url = "/api/zips/invalidZipId";

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

    it("should return status code 400 if city id is invalid", async done => {

      dataTypes.forEach(async item => {

        data.city = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it("should return status code 404 if city id doesn't exist", async done => {

      data.city = utils.getRandomId();

      const res = await prepare();
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if state id is invalid", async done => {

      dataTypes.forEach(async item => {
        data.state = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it("should return status code 404 if state id doesn't exist", async done => {

      data.state = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if location is invalid", async done => {

      dataTypes.forEach(async item => {

        data.loc = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 400 if location coordinates is invalid", async done => {

      dataTypes.forEach(async item => {

        if (item !== 0) {
          data.loc.lat = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it("should return status code 400 if data is invalid", async done => {

      dataTypes.forEach(async item => {

        data = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 200 and zip object if data is valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", zip._id);
      expect(res.body).toHaveProperty("city", String(data.city));
      expect(res.body).toHaveProperty("state", String(data.state));
      expect(res.body).toHaveProperty("loc");
      done();
    });
  });

  describe("DELETE /:id", () => {

    const prepare = () => request(server).delete(url).set("x-auth-token", token);

    beforeEach(async done => {
      /**
       * Before each test create a zip and define url
       */

      zip = await Zip({
        _id: 78701,
        city: city._id,
        state: state._id,
        pop: 3857,
        loc: {lat: -122.330456, lng: 47.611435}
      }).save();

      url = `/api/zips/${zip._id}`;
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the zip
       */
      await zip.remove();
      done();
    });

    it("should return status code 401 if user doesn't logged in", async done => {

      const res = await request(server).delete(url);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 403 if user isn't admin", async done => {

      user.su = false;
      await user.save();

      const _token = await user.generateAuthToken();
      const res = await request(server).delete(url).set("x-auth-token", _token);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      user.su = true;
      await user.save();
      done();
    });

    it("should return status code 404 if zip id is invalid", async done => {

      url = "/api/zips/invalidZipId";
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

    it("should return status code 200 and zip object if zip is exists", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id", zip._id);
      done();
    });
  });
});
