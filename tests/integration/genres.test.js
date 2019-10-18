/**
 * @jest-environment node
 */
const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
let server;
describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Genre.deleteMany({});
    server.close();
  });
  describe("GET /", () => {
    it("Should return all genres", async () => {
      await Genre.collection.insertMany([{ name: "ante1" }, { name: "ante2" }]);
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });
  });
  describe("GET /:id", () => {
    it("Should return genre when valid ID is passed", async () => {
      const genre = new Genre({ name: "name1" });
      await genre.save();
      const res = await request(server).get(`/api/genres/${genre._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });
    it("Should return 404 if  invalid ID is passed", async () => {
      const res = await request(server).get("/api/genres/1");
      expect(res.status).toBe(404);
    });
  });
  describe("POST /", () => {
    it("should return 401 if client is not logged in", async () => {
      const res = await request(server)
        .post("/api/genres")
        .send({ name: "genre1" });
      expect(res.status).toBe(401);
    });
    it("should return 400 if genre(name) is less than 5 characters ", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "gen" });
      expect(res.status).toBe(400);
    });
    it("should return 400 if genre(name) is more than 50 characters ", async () => {
      const token = new User().generateAuthToken();
      const name = new Array(52).join("a");
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: name });
      expect(res.status).toBe(400);
    });
    it("should save the genre if it is valid ", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "genre_test" });
      const genre = await Genre.find({ name: "genre_test" });
      expect(genre).not.toBeNull();
    });
    it("should return genre if it is valid ", async () => {
      const token = new User().generateAuthToken();
      const genre = new Genre({ name: "genre_test2" });
      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: genre.name });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
      expect(res.body).toHaveProperty("_id");
      // TODO (  )
      //expect(res.body).toHaveProperty("_id", mongoose.genre._id);
    });
  });
});
