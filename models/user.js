// setting user schema for creating user and authentication and authorisation purposes

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// using passport package to make it easier to implement
// using passport-local-mongoose for local storage in development
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
	// only email is needed username and passport will be added by passportLocalMongoose utility
	email: {
		type: String,
		required: true,
		unique: true,
	},
});

// this will add username and password (both salt and hash) behind the scene
UserSchema.plugin(passportLocalMongoose);

// handling the unique email error
UserSchema.post("save", function (error, doc, next) {
	if (
		error.name === "MongoServerError" &&
		error.code === 11000 &&
		error.keyValue.email
	) {
		next(
			new Error(
				"Email address was already taken, please choose a different one."
			)
		);
	} else {
		next(error);
	}
});

module.exports = mongoose.model("User", UserSchema);
