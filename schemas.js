// data validation and schema description language tool
const BaseJoi = require("joi");
// sanitize html package
const sanitizeHtml = require("sanitize-html");

// custom made joi extension to sanitize html, escape script and html element from fields entered by user
const extension = joi => ({
	type: "string",
	base: joi.string(),
	messages: {
		"string.escapeHTML": "{{#label}} must not include HTML!",
	},
	rules: {
		escapeHTML: {
			validate(value, helpers) {
				const clean = sanitizeHtml(value, {
					allowedTags: [],
					allowedAttributes: {},
				});
				if (clean !== value)
					return helpers.error("string.escapeHTML", { value });
				return clean;
			},
		},
	},
});

// adding extension
const Joi = BaseJoi.extend(extension);

// joi schema for validating campground forms, create and edit
module.exports.campgroundSchema = Joi.object({
	campground: Joi.object({
		title: Joi.string().required().escapeHTML(),
		price: Joi.number().required().min(0),
		location: Joi.string().required().escapeHTML(),
		blurb: Joi.string().required().escapeHTML(),
		// image: Joi.string().required(),
	}).required(),
	// validation for delete images on edit (otherwise it would break)
	deleteImages: Joi.array(),
});

// joi schema for validating review submit
module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		body: Joi.string().required().escapeHTML(),
		rating: Joi.number().integer().required().min(1).max(5),
	}).required(),
});
