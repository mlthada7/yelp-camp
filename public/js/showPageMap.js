// TO MAKE THE MAP APPEAR
// token and center value from script in show.ejs
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 16, // starting zoom
	projection: 'globe', // display the map as a 3D globe
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>`))
	.addTo(map);
