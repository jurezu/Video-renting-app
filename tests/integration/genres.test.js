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
    it("Should return 404 if genre does not exist", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });
  });
  describe("POST /", () => {
    //define happy path
    //in each test change one parameter that aligns with name of the test
    let token, name;
    const execute = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: name });
    };
    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return 400 if genre(name) is less than 5 characters ", async () => {
      name = "gen";
      const res = await execute();
      expect(res.status).toBe(400);
    });
    it("should return 400 if genre(name) is more than 50 characters ", async () => {
      name = new Array(52).join("a");
      const res = await execute();
      expect(res.status).toBe(400);
    });
    it("should save the genre if it is valid ", async () => {
      await execute();
      const genre = await Genre.find({ name: name });
      expect(genre).not.toBeNull();
    });
    it("should return genre if it is valid ", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
      expect(res.body).toHaveProperty("_id");
    });
  });
  describe("PUT /", () => {
    let token, name, genre, id;
    const execute = async () => {
      return await request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: name });
    };
    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "New name";
      genre = new Genre({ name: "old Name" });
      id = genre._id;
      genre.save();
    });
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return 400 if name is too long (>50)", async () => {
      name = new Array(52).join("a");
      const res = await execute();
      expect(res.status).toBe(400);
    });
    it("should return 400 if name is too short", async () => {
      name = "New";
      const res = await execute();
      expect(res.status).toBe(400);
    });
    it("should return 404 if invalid id is provided", async () => {
      id = 1;
      const res = await execute();
      expect(res.status).toBe(404);
    });
    it("should return 404 if valid id is provided but genre does not exists", async () => {
      id = mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(404);
    });
    it("should return updated object if proper name is provided and genre exists", async () => {
      name = "New name";
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", name);
    });
    it("should update object in db if proper name is provided and genre exists", async () => {
      name = "New name";
      const res = await execute();
      expect(res.status).toBe(200);
      const genre = await Genre.find({ name: name });
      expect(genre).not.toBeNull();
    });
  });
  describe("DELETE /", () => {
    let token, genre, id;
    const execute = async () => {
      return await request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token)
        .send();
    };
    beforeEach(() => {
      const user = {
        _id: mongoose.Types.ObjectId().toHexString(),
        isAdmin: true
      };
      token = new User(user).generateAuthToken();
      genre = new Genre({ name: "old Name" });
      id = genre._id;
      genre.save();
    });
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return 403 if user is not admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();
      expect(res.status).toBe(403);
    });
    it("should return 404 if user is not admin", async () => {
      id = mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(404);
    });
    it("should return deleted object if proper id is sent", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });
    it("should delete object from db if proper id is sent", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      genre = await Genre.findById(id);
      expect(genre).toBeNull();
    });
  });
});
