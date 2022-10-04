const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	// if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
	const campground = new Campground(req.body.campground);
	campground.author = req.user._id;
	await campground.save();
	req.flash('success', 'Campground Data Successfully saved!');
	res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
	const camp = await Campground.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author',
			},
		})
		.populate('author');
	// console.log(camp);
	if (!camp) {
		req.flash('error', 'Campground not found');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/show', { camp });
};

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findById(id);
	if (!camp) {
		req.flash('error', 'Campground not found');
		return res.redirect('/campgrounds');
	}
	res.render('campgrounds/edit', { camp });
};

module.exports.updateCampground = async (req, res) => {
	const { id } = req.params;
	const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	req.flash('success', 'Campground Data Successfully updated!');
	res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteCampground = async (req, res) => {
	const { id } = req.params;
	// Triggers the findOneAndDelete middleware in campgrounds.js
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground Data Successfully deleted!');
	res.redirect('/campgrounds');
};
