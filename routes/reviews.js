const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviews');
const Campground = require('../models/campground');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

//! By default, router keeps params separate
//TODO: add {mergeParams: true} in express.Router()

router.post(
	'/',
	isLoggedIn,
	validateReview,
	catchAsync(async (req, res) => {
		// console.log(req.params);
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		review.author = req.user._id;
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		req.flash('success', 'Created new review!');
		res.redirect(`/campgrounds/${campground.id}`);
	})
);

router.delete(
	'/:reviewId',
	isLoggedIn,
	isReviewAuthor,
	catchAsync(async (req, res) => {
		// console.log(req.params);
		const { id, reviewId } = req.params;
		// $pull = Removes value from 'reviews' array that match reviewId
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		req.flash('success', 'Successfully deleted review!');
		res.redirect(`/campgrounds/${id}`);
	})
);

module.exports = router;
