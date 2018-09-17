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
});
