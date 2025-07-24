// import { apiKey } from './config.js';
const apiKey= "0c1bd42d8381bbd190411e700e1b8e58";

let isCelsius = true;

let lastUsedLat = null;
let lastUsedLon = null;
let lastUsedViaGeolocation = false;
let lastUsedDisplayName = '';

const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    cityName: document.getElementById('cityName'),
    temperature: document.getElementById('temperature'),
    description: document.getElementById('description'),
    weatherIcon: document.getElementById('weatherIcon'),
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    feelsLike: document.getElementById('feelsLike'),
    unitToggle: document.getElementById('unitToggle'),
    weatherMain: document.getElementById('weatherMain'),
    searchForm: document.getElementById('searchForm'),
    suggestionsList: document.getElementById('suggestions'),
    locationNotice: document.getElementById('locationNotice')
};

function setInitialState() {
    elements.cityName.textContent = '';
    elements.temperature.textContent = '';
    elements.description.textContent = '';
    elements.weatherIcon.style.display = 'none';
    elements.windSpeed.textContent = '--';
    elements.humidity.textContent = '--';
    elements.feelsLike.textContent = '--';
    elements.weatherMain.style.opacity = 0;
    elements.locationNotice.style.display = 'none';
}

// Updated: Accept viaGeolocation parameter and use it for notice logic and caching
async function fetchWeatherByCoords(lat, lon, cityDisplayName, showNotice = false, viaGeolocation = false) {
    try {
        const units = isCelsius ? 'metric' : 'imperial';
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
        );
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        data.name = cityDisplayName;
        updateUI(data);

        // Cache for toggling
        lastUsedLat = lat;
        lastUsedLon = lon;
        lastUsedViaGeolocation = viaGeolocation;
        lastUsedDisplayName = cityDisplayName || '';

        // Show location notice only if geolocation was used
        if (showNotice && viaGeolocation && cityDisplayName && cityDisplayName.trim() !== '') {
            elements.locationNotice.textContent = `Showing weather for the nearest known location: ${cityDisplayName}`;
            elements.locationNotice.style.display = 'block';
        } else {
            elements.locationNotice.style.display = 'none';
        }
    } catch (error) {
        showError(error.message);
    }
}

// For manual typing/search, fallback to first suggestion if available
async function fetchWeatherByCityName(city) {
    elements.locationNotice.style.display = 'none';
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
    const res = await fetch(url);
    const cities = await res.json();
    // Filter to only those whose name starts with the input
    const filtered = cities.filter(cityObj =>
        cityObj.name.toLowerCase().startsWith(city.toLowerCase())
    );
    const cityObj = filtered.length ? filtered[0] : cities[0];
    if (cityObj) {
        const displayName = `${cityObj.name}${cityObj.state ? ', ' + cityObj.state : ''}, ${cityObj.country}`;

        lastUsedLat = cityObj.lat;
        lastUsedLon = cityObj.lon;
        lastUsedViaGeolocation = false; // Manual search, not geolocation
        lastUsedDisplayName = displayName;

        // Pass viaGeolocation = false
        fetchWeatherByCoords(cityObj.lat, cityObj.lon, displayName, false, false);
    } else {
        showError("City not found");
    }
}



function updateUI(data) {
    const { temp, feels_like, humidity } = data.main;
    const { speed } = data.wind;
    const weather = Array.isArray(data.weather) ? data.weather[0] : data.weather;
    const { description, icon } = weather;

    elements.cityName.textContent = data.name || '--';
    elements.temperature.textContent = `${Math.round(temp)}°${isCelsius ? 'C' : 'F'}`;
    elements.description.textContent = description ? description.charAt(0).toUpperCase() + description.slice(1) : '';
    elements.windSpeed.textContent = speed !== undefined ? `${speed} ${isCelsius ? 'm/s' : 'mph'}` : '--';
    elements.humidity.textContent = humidity !== undefined ? `${humidity}%` : '--';
    elements.feelsLike.textContent = feels_like !== undefined ? `${Math.round(feels_like)}°${isCelsius ? 'C' : 'F'}` : '--';

    if (icon) {
        elements.weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
        elements.weatherIcon.alt = description || 'Weather Icon';
        elements.weatherIcon.style.display = 'block';
    } else {
        elements.weatherIcon.style.display = 'none';
    }

    elements.weatherMain.style.opacity = 1;
    if (window.feather) feather.replace();
}

function showError(message) {
    elements.cityName.textContent = '';
    elements.temperature.textContent = '';
    elements.description.textContent = message;
    elements.weatherIcon.style.display = 'none';
    elements.windSpeed.textContent = '--';
    elements.humidity.textContent = '--';
    elements.feelsLike.textContent = '--';
    elements.weatherMain.style.opacity = 1;
    elements.locationNotice.style.display = 'none';
}

// --- Autocomplete Suggestions ---
let debounceTimeout;
elements.cityInput.addEventListener('input', function() {
    clearTimeout(debounceTimeout);
    const query = this.value.trim();
    if (query.length < 2) {
        elements.suggestionsList.innerHTML = '';
        return;
    }
    debounceTimeout = setTimeout(() => fetchSuggestions(query), 300);
});

async function fetchSuggestions(query) {
    const url = `/api/weather?type=geo&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const cities = await res.json();
    // Filter to only those whose name starts with the input
    const filtered = cities.filter(cityObj =>
        cityObj.name.toLowerCase().startsWith(query.toLowerCase())
    );
    renderSuggestions(filtered.length ? filtered : []);
}

function renderSuggestions(cities) {
    elements.suggestionsList.innerHTML = '';
    if (!cities.length) return;
    cities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
        li.onclick = () => {
            elements.cityInput.value = li.textContent;
            elements.suggestionsList.innerHTML = '';
            // Pass viaGeolocation = false
            fetchWeatherByCoords(city.lat, city.lon, li.textContent, false, false);
        };
        elements.suggestionsList.appendChild(li);
    });
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (e.target !== elements.cityInput) elements.suggestionsList.innerHTML = '';
});

function toggleUnits() {
    isCelsius = !isCelsius;
    elements.unitToggle.textContent = `°${isCelsius ? 'C' : 'F'}`;

    if (lastUsedLat !== null && lastUsedLon !== null) {
        // Show notice only if lastUsedViaGeolocation is true
        fetchWeatherByCoords(
            lastUsedLat,
            lastUsedLon,
            lastUsedDisplayName,
            lastUsedViaGeolocation, // showNotice
            lastUsedViaGeolocation  // viaGeolocation
        );
    } else if (elements.cityName.textContent && elements.cityName.textContent !== '') {
        fetchWeatherByCityName(elements.cityName.textContent);
    }
}

elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = elements.cityInput.value.trim();
    if (city) {
        fetchWeatherByCityName(city);
        elements.suggestionsList.innerHTML = '';
    }
});

elements.unitToggle.addEventListener('click', toggleUnits);

// --- Geolocation Feature with Reverse Geocoding and Notice ---
elements.locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        elements.cityName.textContent = 'Locating...';
        elements.temperature.textContent = '';
        elements.description.textContent = '';
        elements.weatherIcon.style.display = 'none';
        elements.windSpeed.textContent = '--';
        elements.humidity.textContent = '--';
        elements.feelsLike.textContent = '--';
        elements.weatherMain.style.opacity = 1;
        elements.locationNotice.style.display = 'none';

        navigator.geolocation.getCurrentPosition(
            async position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Reverse geocode to get city/state/country
                try {
                    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
                    const geoRes = await fetch(geoUrl);
                    const geoData = await geoRes.json();
                    let displayName = 'Your Location';
                    if (geoData && geoData.length > 0) {
                        const loc = geoData[0];
                        displayName = `${loc.name || ''}${loc.state ? ', ' + loc.state : ''}${loc.country ? ', ' + loc.country : ''}`;
                    }
                    // Pass viaGeolocation = true
                    fetchWeatherByCoords(lat, lon, displayName, true, true);
                } catch (err) {
                    fetchWeatherByCoords(lat, lon, 'Your Location', true, true);
                }
            },
            error => {
                showError('Unable to retrieve your location');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

// Feather icons
if (window.feather) feather.replace();

// Set initial state on load
setInitialState();