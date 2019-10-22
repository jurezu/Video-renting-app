/**
 * @jest-environment node
 */
const request = require("supertest");
const { User } = require("../../models/user");
const { Genre } = require("../../models/genre");
describe("auth middleware", () => {
  let token;
  beforeEach(() => {
    token = new User().generateAuthToken();
    server = require("../../index");
  });
  afterEach(async () => {
    await Genre.deleteMany({});
    server.close();
  });

  const execute = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  it("should return 401 if token is not provided ('')", async () => {
    token = "";
    const res = await execute();
    expect(res.status).toBe(401);
  });
  it("should return 400 if token is invalid", async () => {
    token = null; //when setting null to x-auth-token will result in type string with value "null"
    const res = await execute();
    expect(res.status).toBe(400);
  });
  it("should return 200 if token is valid provided", async () => {
    const res = await execute();
    expect(res.status).toBe(200);
  });
});
