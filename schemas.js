const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => {
	return {
		type: 'string',
		base: joi.string(),
		messages: {
			'string.escapeHTML': '{{#label}} must not include HTML!',
		},
		rules: {
			escapeHTML: {
				validate(value, helpers, args, options) {
					const clean = sanitizeHtml(value, {
						allowedTags: [],
						allowedAttributes: {},
					});
					if (value !== clean) {
						return helpers.error('string.escapeHTML', { value });
					}
					return clean;
				},
			},
		},
	};
};

const Joi = BaseJoi.extend(extension);

// joi schema validators
module.exports.campgroundSchema = Joi.object({
	campground: Joi.object({
		title: Joi.string().required().escapeHTML(),
		price: Joi.number().required().min(0),
		// image: Joi.string().required(),
		location: Joi.string().required().escapeHTML(),
		description: Joi.string().required().escapeHTML(),
	}).required(),
	deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
	review: Joi.object({
		rating: Joi.number().min(1).max(5).required(),
		body: Joi.string().required().escapeHTML(),
	}).required(),
});
