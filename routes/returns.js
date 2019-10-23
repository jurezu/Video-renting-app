// POST /api/returns {customerId,movieId}
const auth = require("../middleware/auth");
const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const express = require("express");
const router = express.Router();
const moment = require("moment");
const validateMiddleware = require("../middleware/validate");
router.post("/", [auth, validateMiddleware(validate)], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) {
    return res
      .status(404)
      .send("The rental with the given movieId and customerId was not found.");
  }

  if (rental.dateReturned) {
    return res.status(400).send("Movie is already returned.");
  }
  rental.dateReturned = new Date();
  rental.rentalFee =
    rental.movie.dailyRentalRate * moment().diff(rental.dateOut, "days");
  await rental.save();
  await Movie.updateOne(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 }
    }
  );
  res.send(rental);
});

module.exports = router;
// 401 if unauthorised
// 400 if customer id is not provided
// 400 if movie id is not provided
// 404 if movie id and customer id do not match
// 400 if customer already returned the movie
// 200 if it is valid request, set the return date
// 200 calculate the price
// Increase the stock
// Return the rental
