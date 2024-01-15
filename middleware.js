// middleware functions

// importing Joi schemas (joi is data validator and schema description language tool)
const { campgroundSchema, reviewSchema } = require("./schemas");
// express error utility, error handler
const ExpressError = require("./utilities/expressError");
// mongoose models for campgrounds
const Campground = require("./models/campground");
const Review = require("./models/review");

// middleware using passport helper method to check if user is logged in to protect some routes
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash("error", "You must be signed in first!");
		return res.redirect("/login");
	}
	next();
};

// Joi campground validation - Joi tool for validation form data, used as a middleware
module.exports.validateCampground = (req, res, next) => {
	// default is abortEarly : true (this would stop and show first error), abortEarly: false will show all errors split by "," as defined in join(",") method
	const { error } = campgroundSchema.validate(req.body, { abortEarly: false });
	if (error) {
		const msg = error.details.map(el => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else next();
};
// Joi review validation - Joi tool for validation form data, used as a middleware
module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body, { abortEarly: false });
	if (error) {
		const msg = error.details.map(el => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else next();
};

// middleware to check campground authorisation (user is permited to edit /delete based on author)
module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author.equals(req.user._id)) {
		req.flash("error", "You do not have permission to do that!");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};
// middleware to check review authorisation (user is permited to edit /delete based on author)
module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author.equals(req.user._id)) {
		req.flash("error", "You do not have permission to do that!");
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};
