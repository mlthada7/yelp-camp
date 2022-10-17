if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config(); // require .env only in development
}

// require('dotenv').config();
// command to run in production: NODE_ENV=production node app.js

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

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
app.use(mongoSanitize());

const secret = process.env.SECRET || 'mysecret';

// Store session in mongo
const store = MongoStore.create({
	mongoUrl: dbUrl,
	touchAfter: 24 * 60 * 60, // in seconds
});

store.on('error', function (e) {
	console.log('SESSION STORE ERROR', e);
});

// Session stored in memory
const sessionConfig = {
	name: 'session',
	secret,
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		// secure: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
	store,
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

const scriptSrcUrls = [
	'https://stackpath.bootstrapcdn.com/',
	'https://api.tiles.mapbox.com/',
	'https://api.mapbox.com/',
	'https://kit.fontawesome.com/',
	'https://cdnjs.cloudflare.com/',
	'https://cdn.jsdelivr.net/',
	'https://res.cloudinary.com/dpgxkpisf/',
];
const styleSrcUrls = [
	'https://kit-free.fontawesome.com/',
	'https://stackpath.bootstrapcdn.com/',
	'https://api.mapbox.com/',
	'https://api.tiles.mapbox.com/',
	'https://fonts.googleapis.com/',
	'https://use.fontawesome.com/',
	'https://cdn.jsdelivr.net/',
	'https://res.cloudinary.com/dpgxkpisf/',
];
const connectSrcUrls = ['https://*.tiles.mapbox.com', 'https://api.mapbox.com', 'https://events.mapbox.com', 'https://res.cloudinary.com/dpgxkpisf/'];
const fontSrcUrls = ['https://fonts.gstatic.com/'];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", 'blob:'],
			objectSrc: [],
			imgSrc: ["'self'", 'blob:', 'data:', 'https://res.cloudinary.com/dpgxkpisf/', 'https://images.unsplash.com/', 'https://source.unsplash.com'],
			fontSrc: ["'self'", ...fontSrcUrls],
			mediaSrc: ['https://res.cloudinary.com/dv5vm4sqh/'],
			childSrc: ['blob:'],
		},
	})
);

//! Middleware from passport
app.use(passport.initialize());
app.use(passport.session());

//! Middleware from passort-local-mongoose
passport.use(new LocalStrategy(User.authenticate()));
// Store user in session
passport.serializeUser(User.serializeUser());
// Get user out of session
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	// console.log(req.session);
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	res.locals.currentUser = req.user;
	next();
});

//* <=== USER ===>
app.use('/', usersRoutes);

//* <=== CAMPGROUND ROUTES ===>
app.use('/campgrounds', campgroundsRoutes);

//* <=== REVIEWS ===>
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`listening on port ${port}`);
});
