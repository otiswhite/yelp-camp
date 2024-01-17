// if in development mode require dotenv package and add the environment variables to the process.env
if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
// server framework for node
const express = require("express");
// node build-in module for handling and transforming paths
const path = require("path");
// to serve favicon - express rerquest favicon different times and can break routes
const favicon = require("serve-favicon");
// library for working with mongodb
const mongoose = require("mongoose");
// for layouts, partials and block tempaltes
const ejsMate = require("ejs-mate");
// express session package (sessions are used w/ authentication, it's flash package dependency)
const session = require("express-session");
// connsct flash package for showing messages eq. success, alert, failure on data modification
const flash = require("connect-flash");
// for overriding HTTP requests with verbs such as PUT or DELETE
const methodOverride = require("method-override");
// mongoose models for campgrounds, reviews and users
const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user");
// error handling utility
const ExpressError = require("./utilities/expressError");
// authentication middleware for node.js
const passport = require("passport");
// local strategy for passport
const LocalStrategy = require("passport-local");
// helmet package protects against manipulating headers
const helmet = require("helmet");
// security to prevent mongo injection, prevents forbidden characters (by default $ and .) from the key part(as in key - value pairs) in the req.query, req.params and req.body
const mongoSanitize = require("express-mongo-sanitize");
// connect-mongo to store sesion info in the mongo database
const MongoStore = require("connect-mongo");

// requiring routes from express router
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

// database local or hosted on atlas in production
// mongodb atlas (production) process.env.DB_URL OR local "mongodb://localhost:27017/yelp_camp_3"
dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// using build-in node module for setting views directory and pointing paths to it from different folders
app.set("views", path.join(__dirname, "views"));

// serve-favicon set up
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
// setting express to parse slug into request (default is an empty objest)
app.use(express.urlencoded({ extended: true }));
// setting the methodOverride keyword for routes with HTML verb to be changed
app.use(methodOverride("_method"));
// setting up static asset - need to include in boilerplate as script tag - public folder (for files to be accesible to the browser such as js, css, images), setting _dirname path so it can be accessed when app run from different folders
app.use(express.static(path.join(__dirname, "public")));
// express-mongo-sanitize
app.use(mongoSanitize());

// mongo-connect setting
const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60,
	crypto: {
		secret: process.env.SESSION_SECRET,
	},
});
store.on("error", function (e) {
	console.log("Session Store Error", e);
});

// express session config
const sessionConfig = {
	store, // store : store
	secret: process.env.SESSION_SECRET,
	// can give session cookies custom name to improve security
	name: "session",
	// these have been depreciated and need to be resave: false and saveUninitialized: true
	resave: false,
	saveUninitialized: true,
	cookie: {
		// exiry is set in ms, Date.now() gives ms, then add ms this will expire in, 1000(1s) * 60(1m) * 60(1h) * 24(1d) *7(1w)
		// modern browser use only maxAge but older browser eq. IE still use expires
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
		// security setting, (default but set anyway to be sure), when true the cookies cannot be accessed through client side script (if the browser supports this flag)
		httpOnly: true,
		// cookies can be configured only through https (need to set it in prodduction - in dev will break things because of local server)
		// secure: true,
	},
};
app.use(session(sessionConfig));
// flash package
app.use(flash());

// helmet
app.use(helmet());
// helmet content security policy
const scriptSrcUrls = [
	// "https://stackpath.bootstrapcdn.com/",
	"https://api.tiles.mapbox.com/",
	"https://api.mapbox.com/",
	"https://kit.fontawesome.com/",
	"https://cdnjs.cloudflare.com/",
	"https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
	"https://kit-free.fontawesome.com/",
	// "https://stackpath.bootstrapcdn.com/",
	"https://cdn.jsdelivr.net",
	"https://api.mapbox.com/",
	"https://api.tiles.mapbox.com/",
	"https://fonts.googleapis.com/",
	"https://use.fontawesome.com/",
];
const connectSrcUrls = [
	"https://api.mapbox.com/",
	"https://a.tiles.mapbox.com/",
	"https://b.tiles.mapbox.com/",
	"https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
				"https://res.cloudinary.com/dtscswp2k/image/upload/v1705497933/YelpCamp%20Seeds%20Images/", //SEEDS IMAGES
				"https://images.unsplash.com/",
			],
			fontSrc: ["'self'", ...fontSrcUrls],
			childSrc: ["blob:"],
		},
	})
);

// passport setup
app.use(passport.initialize());
// for persistent login sessions (session pacakege), session need to be used in the code before this
app.use(passport.session());
// connecting user model to passport (authenticate() is a static method added automatically by passport local mongoose)
passport.use(new LocalStrategy(User.authenticate()));
// this tells passport how to serialize user - how to store user in the session
passport.serializeUser(User.serializeUser());
// and deserialze - get user out of the session
passport.deserializeUser(User.deserializeUser());

// middleware to add properties to response, to be accesed by all templates if there is a property
app.use((req, res, next) => {
	// checking if user is logged in and showing / hiding login buttons
	// storing url user is trying to access before being asked to log in so we can redirect them back to it after succesfull login, this keeps refresing on each page
	if (!["/login", "/register", "/"].includes(req.originalUrl)) {
		req.session.returnTo = req.originalUrl;
	}
	// passport will add user (object) to req, if no user it is undefined and we add it on to res.locals as a variable currentUser, then in navbar i can show hide buttons depending on the property
	res.locals.currentUser = req.user;
	// middleware for flash, saving messages to res.local, local scope access for each route
	// if there is a message coming from the route handler it will be saved and accessible in the response (boilerplate, partials or individual routes) otherwise no
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

// ROUTES setting up express router
// async ones are wrapped in catchAsync to chatch async errors (basicaly try and catch syntax)

// authentication routes
app.use("/", userRoutes); // user routes
// campground routes
app.use("/campgrounds", campgroundRoutes); // all /campgrounds* requests will be routed to campground file
// review routes // if access to :id is needed in reviews route, this params needs to be set as true in the reviews router file: const router = express.Router({ mergeParams: true });
app.use("/campgrounds/:id/reviews", reviewRoutes);
// home route
app.get("/", (req, res) => {
	res.render("home");
});

// 404 handling (will catch requests to unexisting routes and send it to error handling middleware with 404 status and message)
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

// error handling middleware
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	// 404 message and redirect home
	if (statusCode === 404) {
		req.flash("error", "Page not found");
		return res.redirect("/");
	}
	if (!err.message) err.message = "Something went wrong";
	res.status(statusCode).render("error", { err });
});

// start router
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Serving on port ${port}`);
});
