// import dengan destructuring
module.exports.isLoggedIn = (req, res, next) => {
	// console.log('REQ.USER...', req.user);
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must be signed in first!');
		return res.redirect('/login');
	}
	next();
};

// Import dengan variable
// module.exports = isLoggedIn;
