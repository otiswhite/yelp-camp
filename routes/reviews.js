const express = require("express");
// setting option mergeParams to true so the params are passed to the route from app.js, otherwise we wound not have access to them and would get campground as an empty object as the campground
const router = express.Router({ mergeParams: true });
// our custom utilities
const catchAsync = require("../utilities/catchAsync");
// campground controllers, has methods on it specific to all routes, eq review.create
const reviews = require("../controllers/reviews");
// middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

//REVIEW ROUTES // /review prefix will be added to all as per app.js
// async ones are wrapped in catchAsync to chatch async errors (basicaly try and catch syntax)
// prefix /campgrounds/:id/reviews will be added by express router as per app.js
//post review route
// ! using controller ! all the logis is there
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));
// delete review
router.delete(
	"/:reviewId",
	isLoggedIn,
	isReviewAuthor,
	catchAsync(reviews.deleteReview)
);

module.exports = router;
