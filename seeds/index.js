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
	for (let i = 0; i < 3; i++) {
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
			images: [
				{
					url: 'https://res.cloudinary.com/dpgxkpisf/image/upload/v1665225378/YelpCamp/aog8cpmepb7spjnmyaz4.png',
					filename: 'YelpCamp/aog8cpmepb7spjnmyaz4',
					// _id: new ObjectId('634152a585986d1b546d6462'),
				},
				{
					url: 'https://res.cloudinary.com/dpgxkpisf/image/upload/v1665225380/YelpCamp/iyfcnle2yu86fbhvohah.png',
					filename: 'YelpCamp/iyfcnle2yu86fbhvohah',
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
