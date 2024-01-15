// campgrounds route controller

// mongoose models for campgrounds
const Campground = require("../models/campground");
// using mongoose mongodb methot to check if there is valid id format
const ObjectID = require("mongoose").Types.ObjectId;
// cloudinary, need it for image deletion
const { cloudinary } = require("../cloudinary");
// for working with mapbox api for geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({
	accessToken: process.env.MAPBOX_TOKEN,
});

// index route controller
module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render("campgrounds/index", { campgrounds });
};

// new from show
module.exports.renderNewForm = (req, res) => {
	res.render("campgrounds/new");
};

// new campground post
module.exports.createCampground = async (req, res) => {
	// geocoder for finding location
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.campground.location, // query to search and geolocate
			limit: 1, // how many results, defaul max is 5
		})
		.send();
	const campground = new Campground(req.body.campground);
	// saving geolocation to the campground
	campground.geometry = geoData.body.features[0].geometry;
	// getting image info from req.files and adding them to the campground, multer-storage-coudinary
	campground.images = req.files.map(f => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.author = req.user._id;
	await campground.save();
	// setting up flash messeage , first param is the key, second param is the message
	req.flash("success", "Successfully ceated new campground!");
	res.redirect(`/campgrounds/${campground._id}`);
};

// show campground
module.exports.showCampground = async (req, res) => {
	// using mongoose mongodb methot to check if there is valid id format
	if (!ObjectID.isValid(req.params.id)) {
		// throw new ExpressError("Invalid Id", 400);
		req.flash("error", "Campground not found!");
		return res.redirect("/campgrounds");
	}
	const campground = await Campground.findById(req.params.id)
		// using populate to fill in details as per objectid reference
		.populate("author")
		// nested populate to populate author of reviews inside the campground
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		});
	if (!campground) {
		req.flash("error", "Campground not found!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/show", { campground });
};

// edit form, edit campground
module.exports.renderEditForm = async (req, res) => {
	// using mongoose mongodb methot to check if there is valid id format
	if (!ObjectID.isValid(req.params.id)) {
		// throw new ExpressError("Invalid Id", 400);
		req.flash("error", "Campground not found!");
		return res.redirect("/campgrounds");
	}
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash("error", "Campground not found!");
		return res.redirect("/campgrounds");
	}
	res.render("campgrounds/edit", { campground });
};

// update campground
module.exports.updateCampground = async (req, res) => {
	const campground = await Campground.findByIdAndUpdate(
		req.params.id,
		req.body.campground,
		{ runValidators: true }
	);
	// add images to the edited campground, need to make a variable and spread it in as the fuction expects an array of objects
	const imgs = req.files.map(f => ({
		url: f.path,
		filename: f.filename,
	}));
	campground.images.push(...imgs);
	// update geolocation on the edited campground
	if (req.body.campground.location !== campground.location) {
		let response = await geocoder
			.forwardGeocode({
				query: req.body.campground.location,
				limit: 1,
			})
			.send();
		campground.geometry = response.body.features[0].geometry;
		campground.location = req.body.campground.location;
	}
	await campground.save();
	// delete images (ones selected on edit page by checkboxes)
	if (req.body.deleteImages) {
		// delete form cloudinary (actual image)
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		// delete from mongo database (reference)
		await campground.updateOne({
			$pull: { images: { filename: { $in: req.body.deleteImages } } },
		});
		console.log(campground);
	}
	req.flash("success", "Successfully updated campground!");
	res.redirect(`/campgrounds/${campground._id}`);
};

// delete campground (asociated reviews and images are deleted using mongo post hook in model)
module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash("success", "Successfully deleted campground!");
	res.redirect("/campgrounds");
};
