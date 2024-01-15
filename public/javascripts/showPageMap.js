// mapboxgl.accessToken = "<%- process.env.MAPBOX_TOKEN %>";
// mapToken is specified in ejs campground show page as there is no access to .env file in the frontend
mapboxgl.accessToken = mapboxToken;

const map = new mapboxgl.Map({
	container: "map", // container ID
	style: "mapbox://styles/mapbox/streets-v12", // style URL
	// geting geodata from show page ejs by JSONstrigify method
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 9, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// create a map marker
const marker = new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	// adding pop up on the marker
	.setPopup(
		new mapboxgl.Popup({ offset: 25 }).setHTML(
			`<h5>${campground.title}</h5><h6>${campground.location}</h6>`
		)
	)
	.addTo(map);
