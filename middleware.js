const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/reviews');

// import dengan destructuring
module.exports.isLoggedIn = (req, res, next) => {
	// console.log('REQ.USER...', req.user);
	if (!req.isAuthenticated()) {
		// console.log(req.path, req.originalUrl);
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	next();
};

module.exports.isAuthor = async (req, res, next) => {
	const { id } = req.params;
	const campground = await Campground.findById(id);
	if (!campground.author._id.equals(req.user._id)) {
		req.flash('error', 'You dont have permission!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
	const { id, reviewId } = req.params;
	const review = await Review.findById(reviewId);
	if (!review.author._id.equals(req.user._id)) {
		req.flash('error', 'You dont have permission!');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

module.exports.validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		// details = array of object
		// console.log(error.details);
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next(); // next to the route
	}
};

module.exports.validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next(); // next to the route
	}
};

// Import dengan variable
// module.exports = isLoggedIn;
