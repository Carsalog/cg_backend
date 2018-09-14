const {Car} = require("../../../models/cars");
const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../../../loader");
const utils = require("./utils");


describe("/api/cars", () => {
  /**
   * Test cases for /api/cars endpoint
   */

  let fuel, type, make, model, user, token, url, vin, data, year, car;
  const dataTypes = [0, null, false, undefined, ""];

  // Create car with given VIN
  const createCar = vin => Car({vin, make, model, year, fuel, type}).save();

  beforeEach(async done => {
    /**
     * Before each test:
     *    define: vin, type, make, model, fuel, year variables
     *    create: user
     *    generate: token
     */

    vin = "WBA5A5C51FD520469";
    type = "sedan/saloon";
    make = "BMW";
    model = "528i";
    fuel = "gasoline";
    year = 2015;

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

      car = await createCar(vin);
      car2 = await createCar("WBA5A5C51FD520400");
      car3 = await createCar("WBA5A5C51FD520401");

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

      car = await createCar(vin);

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
});

