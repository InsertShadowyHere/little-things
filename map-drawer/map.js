/*
TODO: 
figure out play zone and only show stops within that zone

FEATURES:
show labeled bus stops nearby - DONE
show circle from bus stops - DONE
show bus routes?
draw from deck
show play zone on map

*/
// DEFINE MAP
let map = L.map('map', { minZoom: 1, maxZoom: 22 }).setView([38.88087, -77.11012], 13);


// Get user's location on page load
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    
    // Center map on user
    map.setView([userLat, userLng], 14);
    
    // Optional: add a marker for user's location
    L.marker([userLat, userLng], {icon: userIcon}).addTo(map)
      .bindPopup('this is you (^ _ ^)/');
  }, error => {
    console.log('User denied location or error:', error);
  });
}

map.doubleClickZoom.disable();
// stop icon
let stopIcon = L.icon({
    iconUrl: 'stop.png',

    iconSize:     [30, 30], // size of the icon
    iconAnchor:   [15, 15], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
});

// player icon
let userIcon = L.icon({iconUrl: 'user-icon-outlined.png',

    iconSize:     [40, 40], // size of the icon
    iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -20], // point from which the popup should open relative to the iconAnchor
    className: 'glow-icon'
});

// Base tiles (allow zoom beyond native 19 by upscaling)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxNativeZoom: 19,
  maxZoom: 22
}).addTo(map);

// Cluster group for bus stop markers
const markersCluster = L.markerClusterGroup();
map.addLayer(markersCluster);


const arlingtonCenter = [38.8816, -77.1043]; // Arlington, VA
const radiusMeters = 9000; // 5km radius

let circle = null;

fetch('transit_stops_arl.geojson')
  .then(response => response.json())
  .then(data => {
    // Filter stops within radius
    const filtered = data.features.filter(feature => {
      const [lng, lat] = feature.geometry.coordinates;
      const distance = L.latLng(lat, lng).distanceTo(arlingtonCenter);
      return distance <= radiusMeters;
    });

    // Add filtered stops to map and make them clickable
    // Add filtered stops to a GeoJSON layer, then into cluster group
    const geoLayer = L.geoJSON({type: 'FeatureCollection', features: filtered}, {
      pointToLayer(feature, latlng) {
        return L.marker(latlng, {icon: stopIcon});
      },
      onEachFeature(feature, layer) { 
        // Log feature properties on click
        layer.on('click', function() {
          const [lng, lat] = feature.geometry.coordinates;

          // Log all properties to the console
          console.log('Feature properties:', feature.properties);

          if (circle) {
            let tmp = 0;
            if (circle.getLatLng()["lat"] === lat && circle.getLatLng()["lng"] === lng)
              tmp = 1;
            map.removeLayer(circle)
            circle = null;
            if (tmp) return;
          }

          circle = L.circle([lat, lng], {
            radius: 200,
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.2
          }).addTo(map);
        });

        // Bind a popup to each marker with ID and name (customize as needed)
        const name = feature.properties.stop_name || '';
        layer.bindPopup(`<b>Name:</b> ${name}`);
      }
    });

    markersCluster.addLayer(geoLayer);
  });