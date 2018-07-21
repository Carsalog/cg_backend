const request = require("supertest");

describe("home page: GET /", () => {

  let server;

  beforeEach(async (done) => {
    server = require("../../../index");
    await done();
  });

  afterEach(async (done) => {
    await server.close();
    await done();
  });

  it("should return status code 200 and HTML of the home page", async(done) => {
    const res = await request(server).get("/");

    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty("content-type", "text/html; charset=utf-8");
    expect(res.text.length > 0).toBeTruthy();
    done();
  })

});