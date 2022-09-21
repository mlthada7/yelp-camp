const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

// mongoose.connect();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
	res.render('home');
});

app.listen(3000, () => {
	console.log('listening on port 3000');
});
