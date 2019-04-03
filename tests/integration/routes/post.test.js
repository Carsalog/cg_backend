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
    make = await new Make({name: "test_post_make"}).save();
    model = await new Model({name: "test_post_model", make: make._id}).save();
    state = await new State({name: "test_post_state", abbreviation: "IL"}).save();
    city = await new City({name: "test_post_city", state: state._id}).save();
    transmission = await new Transmission({type: "test_pt"}).save();

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

      url = `/api/posts?state=${state.name}&city=${city.name}`;

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

      url = `/api/posts?state=${state}`;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if state doesn't pass", async done => {

      url = `/api/posts?city=${city}`;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if state doesn't exist", async done => {

      url = `/api/posts?state=fake_state&city=${city.name}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if city doesn't exist", async done => {

      url = `/api/posts?state=${state.name}&city=doNotExist`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if make passed but doesn't exist", async done => {

      url = `/api/posts?state=${state.name}&city=${city.name}&make=wrongMake`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if model passed but doesn't exist", async done => {

      url = `/api/posts?state=${state.name}&city=${city.name}&make=${make.name}&model=wrongModel`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if model passed without make", async done => {

      url = `/api/posts?state=${state.name}&city=${city.name}&model=${model.name}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 404 if min year is invalid", async done => {

      dataTypes.forEach(async item => {

        url = `/api/posts?state=${state.name}&city=${city.name}&yearMin=${item}`;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if max year is invalid", async done => {

      dataTypes.forEach(async item => {

        url = `/api/posts?state=${state.name}&city=${city.name}&yearMax=${item}`;

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

      url += `&page=1&amount=${amount}`;

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length === amount).toBeTruthy();

      done();
    });

    it("should return status code 200 if passed a valid make", async done => {

      url += `&make=${make.name}`;

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();

      done();
    });

    it("should return status code 200 if passed a valid make and model", async done => {

      url += `&make=${make.name}&model=${model.name}`;

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();

      done();
    });

    it("should return status code 200 if passed a minYear > than car year", async done => {

      url += `&make=${make.name}&model=${model.name}&yearMin=2016`;

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length === 0).toBeTruthy();

      done();
    });

    it("should return 200 and empty array if passed a maxYear < than car year", async done => {

      url += `&make=${make.name}&model=${model.name}&yearMax=2014`;

      const res = await prepare();


      expect(res.status).toBe(200);
      expect(res.body.length === 0).toBeTruthy();

      done();
    });

    it("should return 200 and cars if passed min and max year and cars between them", async done => {

      url += `&make=${make.name}&model=${model.name}&yearMax=2016&yearMin=2014`;

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body.length >= 3).toBeTruthy();

      done();
    });
  });

  describe("GET /:id", () => {

    // Prepare and return get request on url (Promise)
    const prepare = () => request(server).get(url);

    beforeEach(async done => {
      /**
       * Before each test create a post and define url
       */

      post = await createPost("description", 20000, 60000);
      url = `/api/posts/${post._id}`;

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the post
       */

      await post.remove();
      done();
    });

    it("should return status code 404 if post doesn't exist", async done => {

      url = `/api/posts/${utils.getRandomId()}`;

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it('should return status code 404 if a post id is invalid', async done => {

      dataTypes.forEach(async item => {
        if (item !== "") {
          url = `/api/posts/${item}`;

          const res = await prepare();

          expect(res.status).toBe(404);
          expect(res.body).toHaveProperty("error");
        }
      });
      done();
    });

    it("should return status code 201 if the post exists", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("description", "description");
      expect(res.body).toHaveProperty("year", car.year);
      expect(res.body).toHaveProperty("mileage", 60000);
      expect(res.body).toHaveProperty("price", 20000);
      expect(res.body).toHaveProperty("date");
      expect(res.body.isActive).toBeTruthy();
      expect(res.body).toHaveProperty("transmission");
      expect(res.body.images).toMatchObject([]);
      expect(res.body.make).toMatchObject({"_id": String(make._id), "name": make.name});
      expect(res.body.model).toMatchObject({"_id": String(model._id), "name": model.name});
      expect(res.body.state).toMatchObject({"_id": String(state._id), "name": state.name});
      expect(res.body.city).toMatchObject({"_id": String(city._id), "name": city.name});
      expect(res.body.car).toMatchObject({
        "_id": String(car._id),
        "fuel": car.fuel,
        "make": car.make,
        "model": car.model,
        "type": car.type,
        "vin": car.vin,
        "year": car.year
      });
      expect(res.body.author).toMatchObject({
        "_id": String(user._id),
        "email": user.email,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "phone": user.phone
      });

      done();
    });
  });

  describe("POST /", () => {

    let data;

    // Prepare and return POST request on url (Promise)
    const prepare = () => request(server).post(url).set("x-auth-token", token).send(data);

    beforeEach(async done => {
      /**
       * Before each test define url, data
       * @type {{description: string, make: string, model: string, transmission: string, state: string, car: string,
       *        year: integer, city: string, author: string, mileage: integer, price: integer}}
       */

      data = {
        description: "A description",
        make: make._id,
        model: model._id,
        transmission: transmission._id,
        state: state._id,
        car: car._id,
        year: car.year,
        city: city._id,
        author: user._id,
        mileage: 60000,
        price: 20000
      };

      url = "/api/posts";

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove a post
       */

      await Post.remove({description: "A description"});
      done();
    });

    it("should return status code 401 if user doesn't logged in", async done => {

      const res = await request(server).post(url).send(data);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if description is invalid", async done => {

      dataTypes.forEach(async item => {
        if (item !== "") {
          data.description = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it(`should return status code 400 if description is less than 
        ${config.get("posts.description.min")} characters`, async done => {
      const minLength = config.get("posts.description.min");
      if (minLength !== 0) {
        data.description = Array(minLength).join("a");

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      }
      done();
    });

    it(`should return status code 400 if description is more than 
        ${config.get("posts.description.max")} characters`, async done => {

      data.description = Array(config.get("posts.description.max") + 2).join("a");

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 400 if make is invalid", async done => {
      dataTypes.forEach(async item => {

        data.make = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it("should return status code 404 if make doesn't exist", async done => {

      data.make = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if model is invalid", async done => {
      dataTypes.forEach(async item => {

        data.model = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
      done();
    });

    it("should return status code 404 if model doesn't exist", async done => {

      data.model = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if state is invalid", async done => {

      dataTypes.forEach(async item => {

        data.state = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if state doesn't exist", async done => {

      data.state = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if city is invalid", async done => {

      dataTypes.forEach(async item => {

        data.city = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if city doesn't exist", async done => {

      data.city = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if transmission is invalid", async done => {

      dataTypes.forEach(async item => {

        data.transmission = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if transmission doesn't exist", async done => {

      data.transmission = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if year is invalid", async done => {

      dataTypes.forEach(async item => {

        data.year = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it(`should return status code 400 if year is less than ${config.get("cars.year.min")}`, async done => {

      data.year = config.get("cars.year.min") - 1;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it(`should return status code 400 if year is more than ${currentYear}`, async done => {

      data.year = currentYear + 1;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if car is invalid", async done => {

      dataTypes.forEach(async item => {

        data.car = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if car doesn't exist", async done => {

      data.car = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if mileage is invalid", async done => {

      dataTypes.forEach(async item => {

        if (item !== 0) {

          data.mileage = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it("should return status code 400 if price is invalid", async done => {

      dataTypes.forEach(async item => {

        if (item !== 0) {

          data.price = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it("should return status code 201 and a post object if data is valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("isActive", true);
      expect(res.body).toHaveProperty("images");
      expect(res.body).toHaveProperty("tags");
      expect(res.body).toHaveProperty("date");
      expect(res.body).toHaveProperty("make");
      expect(res.body).toHaveProperty("model");
      expect(res.body).toHaveProperty("state");
      expect(res.body).toHaveProperty("city");
      expect(res.body).toHaveProperty("transmission");
      expect(res.body).toHaveProperty("year", car.year);
      expect(res.body).toHaveProperty("mileage", 60000);
      expect(res.body).toHaveProperty("price", 20000);
      expect(res.body.make).toHaveProperty("name", make.name);
      expect(res.body.model).toHaveProperty("name", model.name);
      expect(res.body.state).toHaveProperty("name", state.name);
      expect(res.body.city).toHaveProperty("name", city.name);
      expect(res.body.transmission).toHaveProperty("type", transmission.type);
      expect(res.body.car).toHaveProperty("_id");
      expect(res.body.car).toHaveProperty("make", car.make);
      expect(res.body.car).toHaveProperty("type", car.type);
      expect(res.body.car).toHaveProperty("model", car.model);
      expect(res.body.car).toHaveProperty("fuel", car.fuel);
      expect(res.body.car).toHaveProperty("year", car.year);
      expect(res.body.car).toHaveProperty("vin", car.vin);
      expect(res.body.author).toHaveProperty("_id");
      expect(res.body.author).toHaveProperty("firstName", user.firstName);
      expect(res.body.author).toHaveProperty("lastName", user.lastName);
      expect(res.body.author).toHaveProperty("email", user.email);
      expect(res.body.author).toHaveProperty("phone", user.phone);
      expect(Array.isArray(res.body.images)).toBeTruthy();
      expect(Array.isArray(res.body.tags)).toBeTruthy();

      done();
    });
  });

  describe("PUT /:id", () => {

    let data, state2, city2, make2, model2, transmission2;

    // Prepare and return PUT request
    const prepare = () => request(server).put(url).set("x-auth-token", token).send(data);

    beforeAll(async done => {
      /**
       * Before all tests create: state, city, and transmission
       */

      state2 = await State({name: "California", abbreviation: "CA"}).save();
      city2 = await City({name: "San Francisco", state: state2._id}).save();
      make2 = await Make({name: "make_post3.", models: []}).save();
      model2 = await Model({name: "Post test model", make: make2._id}).save();
      transmission2 = await Transmission({type: "Manual"}).save();
      done();
    });

    beforeEach(async done => {
      /**
       * Before each test create a post, and define data, url
       */

      post = await createPost("A description", 20000, 60000);

      url = `/api/posts/${post._id}`;

      data = {
        state: state2._id,
        city: city2._id,
        make: make2._id,
        model: model2._id,
        car: car._id,
        year: car.year,
        transmission: transmission2._id,
        isActive: false,
        description: "A new description",
        mileage: 70000,
        price: 18000
      };

      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the post
       */

      await post.remove();
      done();
    });

    afterAll(async done => {
      /**
       * After all tests remove state, city, transmission
       */

      await state2.remove();
      await city2.remove();
      await make2.remove();
      await model2.remove();
      await transmission2.remove();
      done();
    });

    it("should return status code 400 if state is invalid", async done => {

      dataTypes.forEach(async item => {

        data.state = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if state doesn't exist", async done => {

      data.state = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if city is invalid", async done => {

      dataTypes.forEach(async item => {

        data.city = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if city doesn't exist", async done => {

      data.city = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");


      done();
    });

    it("should return status code 400 if transmission is invalid", async done => {

      dataTypes.forEach(async item => {

        data.transmission = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 404 if transmission doesn't exist", async done => {

      data.transmission = utils.getRandomId();

      const res = await prepare();

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if description is invalid", async done => {

      dataTypes.forEach(async item => {
        if (item !== "") {
          data.description = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it("should return status code 400 if mileage is invalid", async done => {

      dataTypes.forEach(async item => {
        if (item !== 0) {
          data.mileage = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it("should return status code 400 if price is invalid", async done => {

      dataTypes.forEach(async item => {
        if (item !== 0) {
          data.price = item;

          const res = await prepare();

          expect(res.status).toBe(400);
          expect(res.body).toHaveProperty("error");
        }
      });

      done();
    });

    it("should return status code 400 if isActive is invalid", async done => {

      [0, null, "", [], {}].forEach(async item => {

        data.isActive = item;

        const res = await prepare();

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });

      done();
    });

    it("should return status code 403 if the user tries to edit a post of another user", async done => {

      const res = await request(server).put(url).set("x-auth-token", _token).send(data);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return status code 400 if the city and the state doesn't match", async done => {

      data.state = state._id;

      const res = await prepare();

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return status code 200 and updated object if data is valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      done();
    });
  });

  describe("DELETE /:id", () => {

    // Prepare and return DELETE request on url
    const prepare = () => request(server).delete(url).set("x-auth-token", token);

    beforeEach(async done => {
      /**
       * Before each test
       */

      post = await createPost("A description", 20000, 60000);
      url = `/api/posts/${post._id}`;
      done();
    });

    afterEach(async done => {
      /**
       * After each test remove the post
       */

      await post.remove();
      done();
    });

    it("should return status code 401 if user doesn't logged in", async done => {

      const res = await request(server).delete(url);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      done();
    });

    it("should return 403 if user doesn't have permission to remove the post", async done => {

      const res = await request(server).delete(url).set("x-auth-token", _token);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return 404 if user doesn't have permission to remove the post", async done => {

      const res = await request(server).delete(url).set("x-auth-token", await utils.getRandomToken());

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");

      done();
    });

    it("should return 200 if user and post id is valid", async done => {

      const res = await prepare();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("info");

      done();
    });
  });
});