const mongoose = require('mongoose');
const { cloudinary } = require('../cloudinary');
const Schema = mongoose.Schema;
const Review = require('./reviews');

const ImageSchema = new Schema({
	url: String,
	filename: String,
});

// https://res.cloudinary.com/dpgxkpisf/image/upload/v1665221131/YelpCamp/c8dysk82vcen4kjwgsdf.jpg

ImageSchema.virtual('thumbnail').get(function () {
	return this.url.replace('/upload', '/upload/w_200');
});

const CampgroundSchema = new Schema({
	title: String,
	price: Number,
	description: String,
	location: String,
	images: [ImageSchema],
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	reviews: [
		{
			// ref = Model
			type: Schema.Types.ObjectId,
			ref: 'Review',
		},
	],
});

// Mongoose Query Middleware
// findOneAndDelete TRIGGERED by findByIdAndDelete()
CampgroundSchema.post('findOneAndDelete', async function (camp) {
	if (camp) {
		// delete ALL reviews where the ID is IN the reviews array of camp that is being deleted
		await Review.deleteMany({
			_id: {
				$in: camp.reviews,
			},
		});

		for (let image of camp.images) {
			await cloudinary.uploader.destroy(image.filename);
		}
	}
});

const Campground = mongoose.model('Campground', CampgroundSchema);

module.exports = Campground;
