// helper database builder to help with development

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const Review = require("../models/review");
const images = require("./images");

// onine db atlas

// local db
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
	for (let i = 0; i < 100; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const randomImg31A = Math.floor(Math.random() * 23);
		const randomImg31B = Math.floor(Math.random() * 23);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			// your user id
			author: "659558c1ea7c2c70a0c28371", // colt local db
			// author: , // coltadmin atlas
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			// 	// shorthand for price: price
			price,
			blurb:
				"Beatiful camp in a secluded are of highlands with a ton of activities such as hiking and wild animals tracking. Tents and Trailers are available to rent with optional full service and showers and toilets with running water also sometimes available. ",
			// blurb:
			// 	"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Saepe, sunt? Corrupti amet eum adipisci, ab sit sint, quos praesentium fugit mollitia omnis dolores, veniam animi! Quasi neque debitis nam consectetur!",
			// images: [
			// 	{
			// 		url: "https://res.cloudinary.com/dtscswp2k/image/upload/v1704811828/YelpCamp/jlmgxus886yawkp30jrt.jpg",
			// 		filename: "YelpCamp/jlmgxus886yawkp30jrt.jpg",
			// 	},
			// 	{
			// 		url: "https://res.cloudinary.com/dtscswp2k/image/upload/v1704811828/YelpCamp/xpentubjf3qqtv4t3ozg.jpg",
			// 		filename: "YelpCamp/xpentubjf3qqtv4t3ozg.jpg",
			// 	},
			// ],
			// add 2 random images from the images array:
			images: [images[randomImg31A], images[randomImg31B]],
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
