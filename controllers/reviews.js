const Campground = require('../models/campground');
const Review = require('../models/reviews');

module.exports.createReview = async (req, res) => {
	// console.log(req.params);
	const campground = await Campground.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	campground.reviews.push(review);
	await review.save();
	await campground.save();
	req.flash('success', 'Created new review!');
	res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.deleteReview = async (req, res) => {
	// console.log(req.params);
	const { id, reviewId } = req.params;
	// $pull = Removes value from 'reviews' array that match reviewId
	await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Successfully deleted review!');
	res.redirect(`/campgrounds/${id}`);
};
