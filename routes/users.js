// express router
const express = require("express");
const router = express.Router();
// authentication middleware for node.js
const passport = require("passport");
// catchAsync for async error handling
const catchAsync = require("../utilities/catchAsync");
// user model
const User = require("../models/user");
// users controllers, has methods on it specific to all routes, eq users.renderRegister
const users = require("../controllers/users");

// authentication / user routes

// ! using express router router.route to chain on routes with same path

router
	.route("/register")
	// show register form
	.get(users.renderRegister)
	// post / register new user
	.post(users.register);

router
	.route("/login")
	// login show form
	.get(users.renderLogin)
	// post log in
	.post(
		passport.authenticate("local", {
			failureFlash: true,
			failureRedirect: "/login",
			keepSessionInfo: true, // this should keep session info inc. .returnTo for returning user after being asked to login to the last page they were on
		}),
		users.login
	);

// log out
router.get("/logout", users.logout);

module.exports = router;
