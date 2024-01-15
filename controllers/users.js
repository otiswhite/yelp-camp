// users controller

// user model
const User = require("../models/user");

// register / show form
module.exports.renderRegister = (req, res) => {
	res.render("users/register");
};

// post / register new user
module.exports.register = async (req, res, next) => {
	// try catch to handle errors while registering
	try {
		// destructuring from form submitted
		const { email, username, password } = req.body;
		// creating a new user based on the model
		const user = new User({ email, username });
		// registering user using passport-local-mongoose
		const registeredUser = await User.register(user, password);
		// logging user in after registering, using passport helper method, callback is required (it doesnt support async) to catch error whis is then passed to errro handling middleware with next
		req.login(registeredUser, error => {
			if (error) return next(error);
			// showing flash message and redirecting
			req.flash("success", "Welcome to Yelp Camp!");
			res.redirect("/campgrounds");
		});
	} catch (error) {
		req.flash("error", error.message);
		res.redirect("/register");
	}
};

// login show form
module.exports.renderLogin = (req, res) => {
	res.render("users/login");
};

// post log in
module.exports.login =
	// Now we can use res.locals.returnTo to redirect the user after login
	(req, res) => {
		req.flash("success", "Welcome back");
		const redirectUrl = req.session.returnTo || "/campgrounds";
		res.redirect(redirectUrl);
	};

// logout
module.exports.logout = (req, res, next) => {
	// logout method added to req by passport
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		req.flash("success", "Goodbye!");
		res.redirect("/");
	});
};
