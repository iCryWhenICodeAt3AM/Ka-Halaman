var longitude = "";
var latitude = "";
var documentId = 'JCD2Qk9cMB0waP2W0ep9'; // Replace 'your_document_id' with the actual document ID

// Initialize the map
var map = L.map('map').setView([10.67, 122.95], 10);

// Add the OpenStreetMap tiles
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize Leaflet.draw plugin
var drawnItems = new L.FeatureGroup().addTo(map); // Add drawn items directly to the map
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        marker: {
            icon: new L.Icon.Default()
        }
    }
});
map.addControl(drawControl);

osm.addTo(map);

// Listen for draw events
map.on('draw:created', function(event) {
    var layer = event.layer;

    // Add the drawn item to the drawnItems FeatureGroup
    drawnItems.addLayer(layer);

    // If it's a marker, get its coordinates
    if (layer instanceof L.Marker) {
        var latLng = layer.getLatLng();
        latitude = latLng.lat;
        longitude = latLng.lng;
        console.log("Latitude: " + latitude + ", Longitude: " + longitude);
        // Store latitude and longitude globally
        localStorage.setItem('latitude', latitude);
        localStorage.setItem('longitude', longitude);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for form submission
    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        // Retrieve the farm name input value
        var farmName = document.getElementById('farmNameInput').value;
        // Sample geolocation address
        var geolocation = {
            latitude: localStorage.getItem('latitude'),
            longitude: localStorage.getItem('longitude')
        };

        // Store the farm name in localStorage
        localStorage.setItem('farmName', farmName);

        // Get the document reference
        var docRef = db.collection('information').doc(documentId);

        // Update the farmName and address fields in Firestore
        docRef.update({
            farmName: farmName,
            address: geolocation
        })
        .then(() => {
            console.log('Document successfully updated!');
            // Redirect to weather.html after the update
            window.location.href = 'weather.html';
        })
        .catch((error) => {
            console.error('Error updating document:', error);
        });
    });
});
