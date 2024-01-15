// reviews controller

// mongoose models for campgrounds and reviews
const Campground = require("../models/campground");
const Review = require("../models/review");

// create review
module.exports.createReview = async (req, res) => {
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash("success", "Created new review!");
	res.redirect(`/campgrounds/${campground._id}`);
};

// delete review
module.exports.deleteReview = async (req, res) => {
	const { id, reviewId } = req.params;
	// using mongo operator $pull, it will remove all instances from an array that match conditions
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash("success", "Successfully deleted review!");
	res.redirect(`/campgrounds/${id}`);
};
