const {Post} = require("../../../models/posts");
const {Make} = require("../../../models/makes");
const {Model} = require("../../../models/models");
const {Transmission} = require("../../../models/transmission");
const {State} = require("../../../models/states");
const {City} = require("../../../models/cities");
const request = require("supertest");
const server = require("../../../loader");
const utils = require("./utils");
const {getCurrentYear} = require("../../../lib/tools");
const config = require("config");
const currentYear = getCurrentYear();

describe("/api/posts", () => {
  /**
   * Test cases suit for /api/posts endpoint
   */

  let transmission, make, model, user, token, url, vin, car, state, city, post, badUser, _token;
  const dataTypes = [0, null, false, undefined, ""];
  const createPost = (description, price, mileage) => Post({
    description,
    make: make._id,
    model: model._id,
    transmission: transmission._id,
    state: state._id,
    car: car._id,
    year: car.year,
    city: city._id,
    author: user._id,
    mileage,
    price
  }).save();

  beforeAll(async done => {
    /**
     * Before all tests:
     *    Create: user, car, make, model, state, city, transmission
     *    Generate: token
     *    Define: vin
     */

    vin = "WBA5A5C55FD520474";

    user = await utils.createUser("john.doe@post.test", true);
    token = await user.generateAuthToken();
    badUser = await utils.createUser("bad.user@post.test", false);
    _token = badUser.generateAuthToken();
    car = await utils.createCar("WBA5A5C51FD520000");
    make = await new Make({name: "BMW"}).save();
    model = await new Model({name: "5 series", make: make._id}).save();
    state = await new State({name: "Texas", abbreviation: "TX"}).save();
    city = await new City({name: "Austin", state: state._id}).save();
    transmission = await new Transmission({type: "automatic"}).save();

    done();
  });

  afterAll(async done => {
    /**
     * After all tests remove: user, car, make, model, state, city, transmission
     */

    await user.remove();
    await badUser.remove();
    await car.remove();
    await make.remove();
    await model.remove();
    await state.remove();
    await city.remove();
    await transmission.remove();

    done();
  });

  describe("GET /", () => {

    let post2, post3;

    const prepare = () => request(server).get(url);

    beforeEach(async done => {
      /**
       * Before each test create 3 posts, and define url
       */

      url = "/api/posts?state=texas&city=austin";

      post = await createPost("description", 20000, 60000);
      post2 = await createPost("description2", 20002, 60002);
      post3 = await createPost("description3", 20003, 60003);

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the posts
       */

      await post.remove();
      await post2.remove();
      await post3.remove();

      done();
    });

    it("should return status code 400 if city doesn't pass", async done => {

      url = "/api/posts?state=texas";

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if state doesn't pass", async done => {

      url = "/api/posts?city=austin";

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if state doesn't exist", async done => {

      url = "/api/posts?state=state&city=austin";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if city doesn't exist", async done => {

      url = "/api/posts?state=texas&city=city";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if make passed but doesn't exist", async done => {

      url = "/api/posts?state=texas&city=austin&make=make";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if model passed but doesn't exist", async done => {

      url = "/api/posts?state=texas&city=austin&make=bmw&model=model";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if model passed without make", async done => {

      url = "/api/posts?state=texas&city=austin&model=5 series";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if min year is invalid", async done => {

      dataTypes.forEach(async item => {

        url = `/api/posts?state=texas&city=austin&yearMin=${item}`;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if max year is invalid", async done => {

      dataTypes.forEach(async item => {

        url = `/api/posts?state=texas&city=austin&yearMax=${item}`;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 200 if state and city valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();

      done();
    });

    it("should return status code 200 if passed page and amount", async done => {

      const amount = 2;

      url += "&page=1&amount=" + amount;

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length === amount).toBeTruthy();

      done();
    });

    it("should return status code 200 if passed a valid make", async done => {

      url += "&make=bmw";

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();

      done();
    });

    it("should return status code 200 if passed a valid make and model", async done => {

      url += "&make=bmw&model=5 series";

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();

      done();
    });

    it("should return status code 200 if passed a minYear > than car year", async done => {

      url += "&make=bmw&model=5 series&yearMin=2016";

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length === 0).toBeTruthy();

      done();
    });

    it("should return 200 and empty array if passed a maxYear < than car year", async done => {

      url += "&make=bmw&model=5 series&yearMax=2014";

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length === 0).toBeTruthy();

      done();
    });

    it("should return 200 and cars if passed min and max year and cars between them", async done => {

      url += "&make=bmw&model=5 series&yearMax=2016&yearMin=2014";

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();

      done();
    });
  });

});