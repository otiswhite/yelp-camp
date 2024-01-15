// mongoose model for campgrounds
const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
// cloudinary, need it for image deletion
const { cloudinary } = require("../cloudinary");

const ImageSchema = new Schema({
	url: String,
	filename: String,
});
// adding virtual property on ImageSchema, image thumbnail
// using virtual property because it doesnt have to be stored in database, we are only modifying exisitng url in the database, every time we access it the url in the database will be used to give us modified url
// using cloudinary transformation api to get thumbnail, in url after upload and before actual image folder and name, modification are added, eq,w_200 for 200px width
// original: https://res.cloudinary.com/dtscswp2k/image/upload/v1617207327/YelpCamp/dominik-jirovsky-re2LZOB2XvY-unsplash_hc9f1n.jpg
// modified: https://res.cloudinary.com/dtscswp2k/image/upload/w_200/v1617207327/YelpCamp/dominik-jirovsky-re2LZOB2XvY-unsplash_hc9f1n.jpg
ImageSchema.virtual("thumbnail").get(function () {
	return this.url.replace("/upload", "/upload/w_200");
});

// options
// mongoose by defauld doesn't include virtuals whe nyou convert a document to JSON, so in oreder to access virtuals in the front end need to use set it to tru, we are using to access popupMarkup on the cluster maps
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
	{
		title: String,
		location: String,
		// using geoJson form maxbox api
		geometry: {
			type: {
				type: String,
				enum: ["Point"],
				require: true,
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		price: Number,
		blurb: String,
		images: [ImageSchema],
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		reviews: [
			{
				type: Schema.Types.ObjectId,
				ref: "Review",
			},
		],
	},
	// options as above
	opts
);

// virtual propertie to be under properties so we can use it with cluster maps to show campground name and link in the pop up
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
	return `<a href="/campgrounds/${
		this._id
	}">${this.title}</a><p>${this.blurb.substring(0, 20)}...</p>`;
});

// using mongoose post hook to delete reviews and images belonging to the deleted campground
// in app.js using findByIdAndDelete that will trigger findOneAndDelete middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
	if (doc) {
		// delete asociated reviews
		await Review.deleteMany({
			_id: {
				$in: doc.reviews,
			},
		});
		// delete images on cloudinary
		for (let img of doc.images) {
			await cloudinary.uploader.destroy(img.filename);
		}
	}
});

module.exports = mongoose.model("Campground", CampgroundSchema);
