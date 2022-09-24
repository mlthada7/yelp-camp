const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');

const Campground = require('./models/campground');

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
	catchAsync(async (req, res, next) => {
		// res.send(req.body.campground);
		try {
			const campground = new Campground(req.body.campground);
			await campground.save();
			res.redirect(`/campgrounds/${campground._id}`);
		} catch (e) {
			next(e);
		}
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

// error handling middleware
app.use((err, req, res, next) => {
	res.send('Oh boy.. something went wrong');
});

app.listen(3000, () => {
	console.log('listening on port 3000');
});
