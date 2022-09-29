const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');

// Middleware
const validateCampground = (req, res, next) => {
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

router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

// Order matter.
router.get('/new', isLoggedIn, (req, res) => {
	res.render('campgrounds/new');
});

router.post(
	'/',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res, next) => {
		// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const campground = new Campground(req.body.campground);
		await campground.save();
		req.flash('success', 'Campground Data Successfully saved!');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const camp = await Campground.findById(req.params.id).populate('reviews');
		if (!camp) {
			req.flash('error', 'Campground not found');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/show', { camp });
	})
);

router.get(
	'/:id/edit',
	isLoggedIn,
	catchAsync(async (req, res) => {
		const camp = await Campground.findById(req.params.id);
		if (!camp) {
			req.flash('error', 'Campground not found');
			return res.redirect('/campgrounds');
		}
		res.render('campgrounds/edit', { camp });
	})
);

router.put(
	'/:id',
	isLoggedIn,
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		req.flash('success', 'Campground Data Successfully updated!');
		res.redirect(`/campgrounds/${camp._id}`);
	})
);

router.delete(
	'/:id',
	isLoggedIn,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		// Triggers the findOneAndDelete middleware in campgrounds.js
		await Campground.findByIdAndDelete(id);
		req.flash('success', 'Campground Data Successfully deleted!');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
