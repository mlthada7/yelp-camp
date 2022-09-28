const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');

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
app.use(express.static(path.join(__dirname, 'public'))); // To serve static assets in public folder

const sessionConfig = {
	secret: 'mysecret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

//* <=== CAMPGROUND ROUTES ===>
app.use('/campgrounds', campgroundsRoutes);

//* <=== REVIEWS ===>
app.use('/campgrounds/:id/reviews', reviewsRoutes);

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
