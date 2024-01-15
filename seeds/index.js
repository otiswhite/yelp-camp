// helper database builder to help with development

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const Review = require("../models/review");

mongoose.connect("mongodb://localhost:27017/yelp_camp_3", {
	// useNewUrlParser: true,
	// useCreateIndex: true,
	// useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	await Review.deleteMany({});
	for (let i = 0; i < 50; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			// your user id
			author: "659558c1ea7c2c70a0c28371",
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			// 	// shorthand for price: price
			price,
			blurb:
				"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe, sunt? Corrupti amet eum adipisci, ab sit sint, quos praesentium fugit mollitia omnis dolores, veniam animi! Quasi neque debitis nam consectetur!",
			images: [
				{
					url: "https://res.cloudinary.com/dtscswp2k/image/upload/v1704811828/YelpCamp/jlmgxus886yawkp30jrt.jpg",
					filename: "YelpCamp/jlmgxus886yawkp30jrt.jpg",
				},
				{
					url: "https://res.cloudinary.com/dtscswp2k/image/upload/v1704811828/YelpCamp/xpentubjf3qqtv4t3ozg.jpg",
					filename: "YelpCamp/xpentubjf3qqtv4t3ozg.jpg",
				},
			],
			geometry: {
				type: "Point",
				coordinates: [
					cities[random1000].longitude,
					cities[random1000].latitude,
				],
			},
		});
		await camp.save();
		// console.log(camp);
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
