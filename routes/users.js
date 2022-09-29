const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

router.get('/register', (reg, res) => {
	res.render('users/register');
});

router.post(
	'/register',
	catchAsync(async (req, res) => {
		try {
			const { username, email, password } = req.body.user;
			const user = new User({ username, email });
			const newUser = await User.register(user, password);
			console.log(newUser);
			req.flash('success', 'Welcome to yelp camp!');
			res.redirect('/campgrounds');
		} catch (e) {
			console.log(e);
			req.flash('error', e.message);
			res.redirect('/register');
		}
	})
);

module.exports = router;
