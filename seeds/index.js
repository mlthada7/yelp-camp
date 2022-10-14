const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'CONNECTION ERROR:'));
db.once('open', () => {
	console.log('DATABASE CONNECTED');
});

// get random 'descriptors places'
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 300; i++) {
		// get a random index for cities
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 20) + 10;
		const camp = new Campground({
			author: '633539cb7b68b2d467115b45',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,

			description:
				'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatem corrupti a, culpa nesciunt obcaecati dicta eum maiores, atque maxime minima molestias ducimus? Alias, culpa repellat?',
			price,
			geometry: {
				type: 'Point',
				coordinates: [cities[random1000].longitude, cities[random1000].latitude],
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dpgxkpisf/image/upload/v1665221131/YelpCamp/c8dysk82vcen4kjwgsdf.jpg',
					filename: 'YelpCamp/c8dysk82vcen4kjwgsdf',
					// _id: new ObjectId('634152a585986d1b546d6462'),
				},
				{
					url: 'https://res.cloudinary.com/dpgxkpisf/image/upload/v1665221132/YelpCamp/c9pblx15irvefbjpjjy5.jpg',
					filename: 'YelpCamp/c9pblx15irvefbjpjjy5',
					// _id: new ObjectId('634152a585986d1b546d6463'),
				},
			],
		});
		await camp.save();
	}
};

seedDB().then(() => {
	db.close();
});
