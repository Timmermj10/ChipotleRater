// Initialize the map
var map = L.map('map', {
    attributionControl: false,
    minZoom: 5
}).setView([38.5, -98], 5);

// For zoomed out viewing
var customIcon = L.divIcon({
    className: 'custom-icon',
    html: '<div style="background-color: rgba(68, 21, 0, 1); border-radius: 50%; width: 40px; height: 40px;"><img src="../images/burrito.png" style="width: 20px; height: 20px; position: relative; top: 50%; left: 50%; transform: translate(-50%, -50%);"></div>',
    // Credits for the burrito icon: <a href="https://www.flaticon.com/free-icons/burrito" title="burrito icons">Burrito icons created by IconsNova - Flaticon</a>
    iconSize: [25, 25], // Size of the icon
    iconAnchor: [20, 0], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, 0] // Point from which the popup should open relative to the iconAnchor
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Create a marker cluster group
var markers = L.markerClusterGroup({
    showCoverageOnHover: false // This removes the blue polygon that shows the coverage of the cluster
});

// Fetch Chipotle locations from your API
fetch('http://localhost:3001/api/chipotle-locations')
    .then(response => response.json())
    .then(data => {
        var allMarkers = [];
        var index = 1;
        data.forEach(location => {
            // Add the squareIcon to each of the markers
            var squareIcon = L.divIcon({
                className: 'square-icon',
                html: `<div style="background-color: rgba(68, 21, 0, 1); width: 40px; height: 40px;"><p>${location.name}</p><p>${location.rating}</p></div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 0],
                popupAnchor: [0, 0]
            });
            
            // Define the marker at the given location, give it the custom icon
            var marker = L.marker([location.latitude, location.longitude], 
            {
                icon: customIcon,
                locationId: location.id
            });
            
            // Update the onClick function for the markers to display the modal
            marker.on('click', function() {
                document.getElementById('locationNameLocation').textContent = location.name;
                document.getElementById('locationAddress').textContent = location.address;
                document.getElementById('locationNameRating').textContent = location.name;
                document.getElementById('hiddenLocationId').value = this.options.locationId;
                
                // Update the average rating of the location
                updateAverageRating({ locationId: this.options.locationId });

                // Call the openLocationModal function
                openLocationModal();
            });

            // Adjustments to the tooltip
            marker.bindTooltip(location.name, {
                permanent: false,
                direction: 'top',
            });
            markers.addLayer(marker);
            allMarkers.push({marker: marker, squareIcon: squareIcon});

            // Increment the index
            index++;
        });

        map.addLayer(markers);

        // When we zoom far enough in, change the icon to the squareIcon
        map.on('zoomend', function() {
            var zoomlevel = map.getZoom();
            allMarkers.forEach(item => {
                if (zoomlevel >= 10){
                    item.marker.setIcon(item.squareIcon);
                } else {
                    item.marker.setIcon(customIcon);
                }
            });
        });
    });