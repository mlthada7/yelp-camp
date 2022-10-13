const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocodingService = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
	const campgrounds = await Campground.find({});
	res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
	res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
	// Result in geoJSON
	// coordinates in longitude, latitude
	const geoData = await geocodingService
		.forwardGeocode({
			query: req.body.campground.location,
			limit: 1,
		})
		.send();
	const campground = new Campground(req.body.campground);
	campground.geometry = geoData.body.features[0].geometry;
	campground.images = req.files.map((file) => {
		return {
			url: file.path,
			filename: file.filename,
		};
	});
	campground.author = req.user._id;
	await campground.save();
	console.log(campground);
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
	console.log(req.body);
	const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
	const images = req.files.map((f) => ({
		url: f.path,
		filename: f.filename,
	}));
	camp.images.push(...images);
	await camp.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			// delete in cloudinary
			await cloudinary.uploader.destroy(filename);
		}
		// delete in mongo
		await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
		// console.log(camp);
	}
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
