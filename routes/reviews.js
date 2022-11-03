const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

//! By default, router keeps params separate
//TODO: add {mergeParams: true} in express.Router() to access :id in route

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
