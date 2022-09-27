const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/reviews');
const Campground = require('../models/campground');
const { reviewSchema } = require('../schemas');

// Middleware
const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next(); // next to the route
	}
};

//! By default, router keeps params separate
//TODO: add {mergeParams: true} in express.Router()

router.post(
	'/',
	validateReview,
	catchAsync(async (req, res) => {
		// console.log(req.params);
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground.id}`);
	})
);

router.delete(
	'/:reviewId',
	catchAsync(async (req, res) => {
		// console.log(req.params);
		const { id, reviewId } = req.params;
		// $pull = Removes value from 'reviews' array that match reviewId
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
