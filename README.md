# Weather App

A modern, responsive weather application that provides real-time weather information for any city worldwide. Features include search suggestions, unit toggling (Celsius/Fahrenheit), and a "Use My Location" feature that fetches weather based on your current location.

## Features

- 🔍 Search for cities with autocomplete suggestions  
- 📍 "Use My Location" to get weather for your current location  
- 🌡️ Toggle temperature units between Celsius and Fahrenheit  
- 🌤️ Displays temperature, wind speed, humidity, and "feels like" temperature  
- 📱 Responsive design for desktop and mobile  
- ⚡ Fast, clean, and user-friendly interface  

## Demo

[Live Demo]
https://weather-app-kappa-black-13.vercel.app/

## Installation (Local Setup)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/weather-app.git
   cd weather-app
   ```

2. **Obtain an API key from [OpenWeatherMap](https://openweathermap.org/api).**

3. **Open `script.js` and add your API key:**

   At the top of the file, replace:
   ```js
   // import { apiKey } from './config.js';
   ```

   With:
   ```js
   const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
   ```

4. **Update API fetch URLs in `script.js`:**

   Replace all occurrences of:
   ```js
   /api/weather?type=weather&lat=...&lon=...&units=...
   ```

   With:
   ```js
   https://api.openweathermap.org/data/2.5/weather?lat=...&lon=...&units=...&appid=${apiKey}
   ```

   Replace:
   ```js
   /api/weather?type=geo&q=...
   ```

   With:
   ```js
   https://api.openweathermap.org/geo/1.0/direct?q=...&limit=5&appid=${apiKey}
   ```

   And:
   ```js
   /api/weather?type=reverse&lat=...&lon=...
   ```

   With:
   ```js
   https://api.openweathermap.org/geo/1.0/reverse?lat=...&lon=...&limit=1&appid=${apiKey}
   ```

5. **Serve the project locally:**
   ```bash
   python -m http.server 8000
   ```
   Or use any static server like Live Server in VS Code.

6. **Visit the app in your browser:**
   ```
   http://localhost:8000
   ```

---



## Deployment (Vercel)

1. Push your code to a GitHub repository.

2. Go to [vercel.com](https://vercel.com), import the repo.

3. In **Vercel Dashboard → Project → Settings → Environment Variables**, add:
   ```
   OPENWEATHER_API_KEY = your_actual_api_key_here
   ```

4. Deploy — Vercel will handle hosting and API routing automatically.

## Usage

- Type a city name to see autocomplete suggestions and view its weather.
- Use the location icon to get weather based on your device’s location (with permission).
- Click °C/°F toggle to switch units.

## Technologies Used

- HTML5, CSS3, JavaScript (ES6 Modules)
- [OpenWeatherMap API](https://openweathermap.org/)
- Feather Icons
- Local API routing via Vercel

## Author

**Shreyasi G**
"# WeatherApp" 
