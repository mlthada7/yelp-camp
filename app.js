const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

const Campground = require('./models/campground');
const Review = require('./models/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'CONNECTION ERROR:'));
db.once('open', () => {
	console.log('DATABASE CONNECTED');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

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

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next(); // next to the route
	}
};

//* <=== CAMPGROUND ROUTES ===>
app.get(
	'/campgrounds',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);

// Order matter.
app.get('/campgrounds/new', (req, res) => {
	res.render('campgrounds/new');
});

app.post(
	'/campgrounds',
	validateCampground,
	catchAsync(async (req, res, next) => {
		// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
		const campground = new Campground(req.body.campground);
		await campground.save();
		res.redirect(`/campgrounds/${campground._id}`);
	})
);

app.get(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const camp = await Campground.findById(req.params.id);
		res.render('campgrounds/show', { camp });
	})
);

app.get(
	'/campgrounds/:id/edit',
	catchAsync(async (req, res) => {
		const camp = await Campground.findById(req.params.id);
		res.render('campgrounds/edit', { camp });
	})
);

app.put(
	'/campgrounds/:id',
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		res.redirect(`/campgrounds/${camp._id}`);
	})
);

app.delete(
	'/campgrounds/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		res.redirect('/campgrounds');
	})
);

//* <=== REVIEWS ===>
app.post(
	'/campgrounds/:id/reviews',
	validateReview,
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		const review = new Review(req.body.review);
		campground.reviews.push(review);
		await review.save();
		await campground.save();
		res.redirect(`/campgrounds/${campground.id}`);
	})
);

app.all('*', (req, res, next) => {
	next(new ExpressError('Page not found', 404));
});

// error handling middleware
// all error masuk sini
app.use((err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) err.message = 'Oh no.. something went wrong!';
	res.status(status).render('error', { err });
});

app.listen(3000, () => {
	console.log('listening on port 3000');
});
