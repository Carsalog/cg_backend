const {Car} = require("../../../models/cars");
const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../loader");
const utils = require("./utils");
const config = require("config");


describe("/api/cars", () => {
  /**
   * Test cases for /api/cars endpoint
   */

  let user, token, url, vin, data, car;
  const dataTypes = [0, null, false, undefined, ""];

  beforeEach(async done => {
    /**
     * Before each test:
     *    define: vin, type, make, model, fuel, year variables
     *    create: user
     *    generate: token
     */

    vin = "WBA5A5C51FD000000";

    user = await utils.createUser("john.doe@car.test", true);
    token = await user.generateAuthToken();

    done();
  });

  afterEach(async done => {
    /**
     * After each test remove user
     */

    await user.remove();
    done();
  });

  describe("GET /", () => {

    let car2, car3;

    // Prepare and return request promise
    const prepare = () => request(server).get(url).set("x-auth-token", token);

    beforeEach(async done => {
      /**
       * Before each test: define url and create cars
       */

      url = "/api/cars";

      car = await utils.createCar(vin);
      car2 = await utils.createCar("WBA5A5C51FD520400");
      car3 = await utils.createCar("WBA5A5C51FD520401");

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove cars
       */

      await car.remove();
      await car2.remove();
      await car3.remove();
      done();
    });

    it("should return status code 403 if user isn't admin", async done => {

      user.su = false;
      await user.save();
      const _token = await user.generateAuthToken();
      const res = await request(server).get(url).set("x-auth-token", _token);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      user.su = true;
      await user.save();
      done();
    });

    it("should return status code 200 and list of cars if GET parameters do not given", async done => {
      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();
      done();
    });

    it("should return status code 200 and list of cars if GET parameters defined", async done => {

      const amount = 2;
      url = `/api/cars?page=1&amount=${amount}`;
      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length === amount).toBeTruthy();
      done();
    });
  });

  describe("GET /:id", () => {

    // Prepare and return get request on url (Promise)
    const prepare = () => request(server).get(url).set("x-auth-token", token);

    beforeEach(async done => {
      /**
       * Before each test create a car and define url;
       */

      car = await utils.createCar(vin);

      url = `/api/cars/${car._id}`;
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the car
       */

      await car.remove();
      done();
    });

    it("should return status code 404 if car id is invalid", async done => {

      url = "/api/cars/1";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if car doesn't exist", async done => {

      url = `/api/cars/${mongoose.Types.ObjectId().toHexString()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 if car exists", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      done();
    });
  });

  describe("GET /by/vin/:vin", () => {

    // Prepare and return request promise on url
    const prepare = () => request(server).get(url).set("x-auth-token", token);

    beforeEach(async done => {
      /**
       * Before each test create a car and define url
       */

      car = await utils.createCar(vin);

      url = `/api/cars/by/vin/${car.vin}`;
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the car
       */

      await car.remove();
      await Car.findOne({vin: "WBA5A5C51FD520469"}).remove();
      done();
    });

    it("should return status code 400 if VIN is invalid", async done => {

      url = "/api/cars/by/vin/invalidVIN";

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return SC 201 and car object if car didn't exist (online required)", async done => {

      if (config.get("online")) {
        url = "/api/cars/by/vin/WBA5A5C51FD520469";

        const res = await prepare();

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body).toHaveProperty("vin", "WBA5A5C51FD520469");
      }

      done();
    });

    it("should return status code 200 if VIN is valid and user is not admin", async done => {

      user.su = false;
      await user.save();
      const _token = await user.generateAuthToken();
      const res = await request(server).get(url).set("x-auth-token", _token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("vin", vin);
      expect(res.body).toHaveProperty("make", "BMW");
      expect(res.body).toHaveProperty("model", "528i");
      expect(res.body).toHaveProperty("year", 2015);

      user.su = true;
      await user.save();
      done();
    });
  });

  describe("PUT /:id", () => {

    // Prepare and return PUT request on url (Promise)
    const prepare = () => request(server).put(url).set("x-auth-token", token).send(data);

    beforeEach(async done => {
      /**
       * Before each test create a car and define url and data object
       */

      car = await utils.createCar(vin);

      url = `/api/cars/${car._id}`;
      data = {
        vin:    vin,
        make:   "make",
        model:  "model",
        type:   "type",
        year:   2007,
        fuel:   "hybrid",
      };

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the car
       */

      await car.remove();
      done();
    });

    it("should return status code 401 if user does not logged in", async done => {

      const res = await request(server).put(url).send({});

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });


    it("should return status code 400 if vin is invalid", async done => {

      dataTypes.forEach(async type => {
        data.vin = type;
        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 400 if vin was changed", async done => {

      data.vin = "WBAFU9C50BC786021";
      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 200 if vin valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("vin", vin);
      expect(res.body).toHaveProperty("make", data.make);
      expect(res.body).toHaveProperty("model", data.model);
      expect(res.body).toHaveProperty("fuel", data.fuel);
      expect(res.body).toHaveProperty("type", data.type);
      expect(res.body).toHaveProperty("year", data.year);

      done();
    });
  });

  describe("DELETE /:id", () => {

    // Prepare and return DELETE request on url (Promise)
    const prepare = () => request(server).delete(url).set("x-auth-token", token);

    beforeEach(async done => {
      /**
       * Before each test create car and define url
       */

      car = await utils.createCar(vin);

      url = `/api/cars/${car._id}`;

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove car
       */

      await car.remove();
      done();
    });

    it("should return 401 if user isn't logged", async done => {

      const res = await request(server).delete(url);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return 403 if user isn't admin", async done => {

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

    it("should return status code 404 if car id is invalid", async done => {

      url = "/api/cars/invalidId";

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 404 if car doesn't exist", async done => {

      url = `/api/cars/${mongoose.Types.ObjectId().toHexString()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 if car exist and user is admin", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("vin", vin);

      // Make sure that car was removed
      expect(await Car.getById(res.body._id)).toBe(null);

      done();
    });
  });
});

