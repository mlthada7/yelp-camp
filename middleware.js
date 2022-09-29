// import dengan destructuring
module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	next();
};

// Import dengan variable
// module.exports = isLoggedIn;
