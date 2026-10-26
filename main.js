// ==========================================
// 1. Initialize Leaflet Map
// ==========================================
// Centered on University of Pretoria main campus coordinates
const map = L.map('map').setView([-25.7545, 28.2314], 16);

// Add OpenStreetMap base tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ==========================================
// 2. Create Layer Groups
// ==========================================
const benchGroup = L.layerGroup().addTo(map);
const chairTablesGroup = L.layerGroup().addTo(map);
const foodGroup = L.layerGroup().addTo(map);
const grassGroup = L.layerGroup().addTo(map);
const informalGroup = L.layerGroup().addTo(map);
const lectureGroup = L.layerGroup().addTo(map);

// Data variables
let benchesData = null;
let chairTablesData = null;
let foodData = null;
let grassData = null;
let informalData = null;
let lectureData = null;

// ==========================================
// 3. Load GeoJSON Datasets Asynchronously
// ==========================================
async function loadCampusData() {
  // Helper function to fetch data safely without crashing the map on loading errors
  const fetchLayer = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`Skipping ${url} due to loading error:`, err);
      return { type: "FeatureCollection", features: [] };
    }
  };

  benchesData = await fetchLayer('data/Benches.geojson');
  chairTablesData = await fetchLayer('data/ChairTables.geojson');
  foodData = await fetchLayer('data/FoodLocations.geojson');
  grassData = await fetchLayer('data/GrassSeating.geojson');
  informalData = await fetchLayer('data/InformalSeating.geojson');
  lectureData = await fetchLayer('data/LectureVenues.geojson');

  renderMapLayers();
}

// ==========================================
// 4. Property Attribute Helper Functions
// ==========================================
// Flexible check for WiFi availability across different naming formats ('Wifi', 'WiFi', 'wifi', 1, true, 'Yes')
function hasWifi(properties) {
  if (!properties) return false;
  const val = properties.Wifi ?? properties.WiFi ?? properties.wifi;
  return val === 1 || val === true || val === 'Yes' || val === 'Yes ';
}

// Flexible check for Power Outlets ('Power', 'power', 1, true, 'Yes')
function hasPower(properties) {
  if (!properties) return false;
  const val = properties.Power ?? properties.power;
  return val === 1 || val === true || val === 'Yes' || val === 'Yes ';
}

// ==========================================
// 5. Render Layers & Update Metrics
// ==========================================
function renderMapLayers() {
  // Clear existing layers from map
  benchGroup.clearLayers();
  chairTablesGroup.clearLayers();
  foodGroup.clearLayers();
  grassGroup.clearLayers();
  informalGroup.clearLayers();
  lectureGroup.clearLayers();

  // Read filter dropdown values safely
  const wifiFilterElem = document.getElementById('wifiFilter');
  const powerFilterElem = document.getElementById('powerFilter');
  
  const wifiFilter = wifiFilterElem ? wifiFilterElem.value : 'all';
  const powerFilter = powerFilterElem ? powerFilterElem.value : 'all';

  // Combined Filter Helper (checks both WiFi and Power selections)
  const filterFeature = (feature) => {
    if (wifiFilter === 'yes' && !hasWifi(feature.properties)) return false;
    if (powerFilter === 'yes' && !hasPower(feature.properties)) return false;
    return true;
  };

  // --- A. Benches Layer ---
  let countBenches = 0;
  L.geoJSON(benchesData, {
    filter: filterFeature,
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 5, fillColor: '#007bff', color: '#ffffff', weight: 1, fillOpacity: 0.8
    }),
    onEachFeature: (feature, layer) => {
      countBenches++;
      const p = feature.properties;
      layer.bindPopup(`
        <h6>🪑 Bench</h6>
        <hr class="my-1">
        <b>Building:</b> ${p.Lecture || 'N/A'}<br>
        <b>Food Area:</b> ${p.Food_Loca || 'N/A'}<br>
        <b>WiFi:</b> ${hasWifi(p) ? 'Available' : 'No'}<br>
        <b>Power:</b> ${hasPower(p) ? 'Available' : 'No'}
      `);
    }
  }).addTo(benchGroup);

  // --- B. Chair & Tables Layer ---
  let countChairs = 0;
  L.geoJSON(chairTablesData, {
    filter: filterFeature,
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 5, fillColor: '#17a2b8', color: '#ffffff', weight: 1, fillOpacity: 0.8
    }),
    onEachFeature: (feature, layer) => {
      countChairs++;
      const p = feature.properties;
      layer.bindPopup(`
        <h6>🪑 Chair & Table</h6>
        <hr class="my-1">
        <b>Building:</b> ${p.Lecture || 'N/A'}<br>
        <b>Food Area:</b> ${p.Food_Loca || 'N/A'}<br>
        <b>WiFi:</b> ${hasWifi(p) ? 'Available' : 'No'}<br>
        <b>Power:</b> ${hasPower(p) ? 'Available' : 'No'}
      `);
    }
  }).addTo(chairTablesGroup);

  // --- C. Food Locations Layer ---
  let countFood = 0;
  L.geoJSON(foodData, {
    filter: filterFeature,
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 7, fillColor: '#dc3545', color: '#ffffff', weight: 1, fillOpacity: 0.9
    }),
    onEachFeature: (feature, layer) => {
      countFood++;
      const p = feature.properties;
      layer.bindPopup(`
        <h6>🍔 ${p.Name || 'Food Location'}</h6>
        <hr class="my-1">
        <b>Outdoor Seating:</b> ${p.OutSeat ? 'Yes' : 'No'}<br>
        <b>WiFi:</b> ${hasWifi(p) ? 'Available' : 'No'}<br>
        <b>Power:</b> ${hasPower(p) ? 'Available' : 'No'}
      `);
    }
  }).addTo(foodGroup);

  // --- D. Grass Seating Layer ---
  let countGrass = 0;
  L.geoJSON(grassData, {
    filter: filterFeature,
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 6, fillColor: '#ffc107', color: '#ffffff', weight: 1, fillOpacity: 0.8
    }),
    onEachFeature: (feature, layer) => {
      countGrass++;
      const p = feature.properties;
      layer.bindPopup(`
        <h6>🌿 Grass Seating</h6>
        <hr class="my-1">
        <b>Location:</b> ${p.Location || 'N/A'}<br>
        <b>Area:</b> ${p.Area || 'N/A'}<br>
        <b>WiFi:</b> ${hasWifi(p) ? 'Available' : 'No'}<br>
        <b>Power:</b> ${hasPower(p) ? 'Available' : 'No'}
      `);
    }
  }).addTo(grassGroup);

  // --- E. Informal Seating Layer ---
  let countInformal = 0;
  L.geoJSON(informalData, {
    filter: filterFeature,
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 6, fillColor: '#6c757d', color: '#ffffff', weight: 1, fillOpacity: 0.8
    }),
    onEachFeature: (feature, layer) => {
      countInformal++;
      const p = feature.properties;
      layer.bindPopup(`
        <h6>🧱 Informal Seating</h6>
        <hr class="my-1">
        <b>Location:</b> ${p.Location || 'N/A'}<br>
        <b>Type:</b> ${p.Type || 'N/A'}<br>
        <b>WiFi:</b> ${hasWifi(p) ? 'Available' : 'No'}<br>
        <b>Power:</b> ${hasPower(p) ? 'Available' : 'No'}
      `);
    }
  }).addTo(informalGroup);

  // --- F. Lecture Venues Layer ---
  let countLectures = 0;
  L.geoJSON(lectureData, {
    filter: filterFeature,
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 8, fillColor: '#28a745', color: '#ffffff', weight: 1, fillOpacity: 0.9
    }),
    onEachFeature: (feature, layer) => {
      countLectures++;
      const p = feature.properties;
      layer.bindPopup(`
        <h6>🏫 ${p.Name || 'Lecture Venue'}</h6>
        <hr class="my-1">
        <b>WiFi:</b> ${hasWifi(p) ? 'Available' : 'No'}<br>
        <b>Power:</b> ${hasPower(p) ? 'Available' : 'No'}
      `);
    }
  }).addTo(lectureGroup);

  // --- Update Sidebar Counter Elements ---
  const setElemText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElemText('benchCount', countBenches);
  setElemText('chairCount', countChairs);
  setElemText('grassCount', countGrass);
  setElemText('informalCount', countInformal);
  setElemText('foodCount', countFood);
  setElemText('lectureCount', countLectures);
}

// ==========================================
// 6. UI Toggle Event Listeners
// ==========================================
const bindToggle = (id, group) => {
  const elem = document.getElementById(id);
  if (elem) {
    elem.addEventListener('change', (e) => {
      e.target.checked ? map.addLayer(group) : map.removeLayer(group);
    });
  }
};

bindToggle('toggleBenches', benchGroup);
bindToggle('toggleChairTables', chairTablesGroup);
bindToggle('toggleFood', foodGroup);
bindToggle('toggleGrass', grassGroup);
bindToggle('toggleInformal', informalGroup);
bindToggle('toggleLectures', lectureGroup);

// WiFi Filter Event Listener
const wifiFilterElem = document.getElementById('wifiFilter');
if (wifiFilterElem) {
  wifiFilterElem.addEventListener('change', () => {
    renderMapLayers();
  });
}

// Power Filter Event Listener
const powerFilterElem = document.getElementById('powerFilter');
if (powerFilterElem) {
  powerFilterElem.addEventListener('change', () => {
    renderMapLayers();
  });
}

// Start application
loadCampusData();