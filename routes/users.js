const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const passport = require('passport');

router.get('/register', (reg, res) => {
	res.render('users/register');
});

router.post(
	'/register',
	catchAsync(async (req, res) => {
		try {
			const { username, email, password } = req.body;
			const user = new User({ username, email });
			const registeredUser = await User.register(user, password);
			// console.log(registerdUser);
			req.login(registeredUser, (err) => {
				if (err) return next(err);
				req.flash('success', `Welcome to yelp camp, ${req.user.username}!`);
				res.redirect('/campgrounds');
			});
		} catch (e) {
			// console.log(e);
			req.flash('error', e.message);
			res.redirect('/register');
		}
	})
);

router.get('/login', (req, res) => {
	res.render('users/login');
});

// With passport middleware
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
	req.flash('success', `Welcome back, ${req.user.username}!`);
	res.redirect('/campgrounds');
});

router.get('/logout', async (req, res) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		req.flash('success', 'Goodbye!');
		res.redirect('/campgrounds');
	});
});

module.exports = router;
