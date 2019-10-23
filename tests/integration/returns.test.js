/**
 * @jest-environment node
 */
const request = require("supertest");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const { Movie } = require("../../models/movie");
const mongoose = require("mongoose");
const moment = require("moment");
describe("/api/returns", () => {
  let server, customerId, movieId, token, rental, movie;
  beforeEach(async () => {
    server = require("../../index");
    token = new User().generateAuthToken();
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    rental = new Rental({
      customer: {
        name: "customer1",
        phone: 12345,
        _id: customerId
      },
      movie: {
        title: "title1",
        dailyRentalRate: 3,
        _id: movieId
      }
    });
    movie = new Movie({
      title: "title1",
      genre: { name: "drama" },
      numberInStock: 10,
      dailyRentalRate: 3,
      _id: movieId
    });
    await movie.save();
    await rental.save();
  });
  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });
  const execute = async function() {
    return await request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId: customerId, movieId: movieId });
  };

  it("should return 401 if client is not logged in", async () => {
    token = "";
    const res = await execute();
    expect(res.status).toBe(401);
  });
  it("should return 400 if movie id is not provided", async () => {
    movieId = "";
    const res = await execute();
    expect(res.status).toBe(400);
  });
  it("should return 400 if customer id is not provided", async () => {
    customerId = "";
    const res = await execute();
    expect(res.status).toBe(400);
  });

  it("should return 404 if customer id and movie id do not match any rentals", async () => {
    await Rental.deleteMany({});
    const res = await execute();
    expect(res.status).toBe(404);
  });
  it("should return 400 if rental is already processed", async () => {
    await Rental.findByIdAndUpdate(rental._id, { dateReturned: new Date() });
    const res = await execute();
    expect(res.status).toBe(400);
  });

  it("should return 200 if it is valid request", async () => {
    const res = await execute();
    expect(res.status).toBe(200);
  });

  it("should return updated object with returnDate", async () => {
    const res = await execute();
    expect(res.status).toBe(200);
    const difference = new Date() - Date.parse(res.body.dateReturned);
    expect(res.body.dateReturned).toBeDefined();
    expect(difference).toBeLessThan(10 * 1000); //10 seconds in worst case scenario
  });
  it("should updated object with returnDate in db", async () => {
    await execute();
    rental = await Rental.findById(rental._id);
    const difference = new Date() - rental.dateReturned;
    expect(rental.dateReturned).toBeDefined();
    expect(difference).toBeLessThan(10 * 1000); //10 seconds in worst case scenario
  });
  it("should updated object with rental fee in db", async () => {
    rental.dateOut = moment()
      .add(-7, "days")
      .toDate();
    await rental.save();
    await execute();
    rental = await Rental.findById(rental._id);
    expect(rental.rentalFee).toBeDefined();
    expect(rental.rentalFee).toBe(21);
  });
  it("should return updated object with rental fee", async () => {
    rental.dateOut = moment()
      .add(-7, "days")
      .toDate();
    await rental.save();
    const res = await execute();
    expect(res.body.rentalFee).toBeDefined();
    expect(res.body.rentalFee).toBe(21);
  });
  it("should update number of movies in stock", async () => {
    rental.dateOut = moment()
      .add(-7, "days")
      .toDate();
    await rental.save();
    await execute();
    updatedMovie = await Movie.findById(movieId);
    expect(updatedMovie.numberInStock).toBe(movie.numberInStock + 1);
  });
  it("should return rental ", async () => {
    rental.dateOut = moment()
      .add(-7, "days")
      .toDate();
    await rental.save();
    const res = await execute();
    rental = await Rental.findById(rental._id);
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie"
      ])
    );
  });
});
