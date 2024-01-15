const express = require("express");
const router = express.Router();
// our custom utilities
const catchAsync = require("../utilities/catchAsync");
// campground controllers, has methods on it specific to all routes, eq campgrounds.index
const campgrounds = require("../controllers/campgrounds");
// our custom middleware to check if user is logged in
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
// multer middleware handling multipart/form-data, which is primarily used for uploading files
const multer = require("multer");
const { storage } = require("../cloudinary");
const { validate } = require("../models/review");
const upload = multer({ storage });

// campground routes
// async ones are wrapped in catchAsync to chatch async errors (basicaly try and catch syntax)
// using router.* as opposed to app.*
// /campgrounds prefix will be added to all as per app.js
// ! using controllers to move the logic away from routes ! then using methods attached to it eq campgrounds.index
// ! using express router router.route to chain on routes with same path
router
	.route("/") // this is campgrounds/
	// show all campgrounds
	.get(catchAsync(campgrounds.index)) // then we chain on routes to the same path
	// create campground
	.post(
		isLoggedIn,
		// multer-storage-cloudinary / upload should be after validation but needs to be recoded
		upload.array("image"),
		validateCampground,
		catchAsync(campgrounds.createCampground)
	);
// new ! need to be above show route !
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
	.route("/:id")
	// show campground
	.get(catchAsync(campgrounds.showCampground))
	// update campground
	.put(
		isLoggedIn,
		isAuthor,
		// image upload multer / cloudinary
		upload.array("image"),
		validateCampground,
		catchAsync(campgrounds.updateCampground)
	)
	//delete
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// edit
router.get(
	"/:id/edit",
	isLoggedIn,
	isAuthor,
	catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
