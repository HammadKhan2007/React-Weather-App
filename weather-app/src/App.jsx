import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Styling ke liye

function App() {
  const [cityName, setCityName] = useState('');
  // weatherData ab aapke original API response ko store karega (e.g., { current: {...} })
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_ENDPOINT = 'https://p2pclouds.up.railway.app/v1/learn/weather?city=';

  const getWeather = async (e) => {
    e.preventDefault();

    if (!cityName.trim()) {
      setError("Please enter a city name.");
      setWeatherData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null); // Clear previous data

    try {
      const res = await axios.get(`${API_ENDPOINT}${cityName}`);
      console.log("Your API Response:", res.data); // Aapka original console.log

      // Yahan hum expect kar rahe hain ke res.data mein 'current' object hoga jaisa aapke purane JS mein tha.
      // Agar 'current' object ya 'temp_c' nahi milta, toh error set kar denge.
      if (res.data && res.data.current && typeof res.data.current.temp_c !== 'undefined') {
        setWeatherData(res.data); // Poora response object save kar rahe hain
         setCityName('');
      } else {
        // Agar response structure expected nahi hai
        setError("Could not get temperature. Please try a different city or check API response.");
      }

    } catch (err) {
      console.error("Failed to fetch weather:", err);
      if (err.response && err.response.status === 404) {
        setError("City not found. Please enter a valid city name.");
      } else {
        setError("Something went wrong, please check your internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get a dynamic background class based on weather condition
  // Condition hum weatherData.current.condition.text se lenge
  const getBackgroundClass = (conditionText) => {
    if (!conditionText) return 'bg-default';
    conditionText = conditionText.toLowerCase();
    if (conditionText.includes('clear') || conditionText.includes('sunny')) return 'bg-clear';
    if (conditionText.includes('cloud') || conditionText.includes('overcast')) return 'bg-clouds';
    if (conditionText.includes('rain') || conditionText.includes('drizzle') || conditionText.includes('shower')) return 'bg-rain';
    if (conditionText.includes('thunder') || conditionText.includes('storm')) return 'bg-thunder';
    if (conditionText.includes('snow') || conditionText.includes('ice') || conditionText.includes('sleet')) return 'bg-snow';
    if (conditionText.includes('mist') || conditionText.includes('fog')) return 'bg-mist';
    return 'bg-default';
  };

  return (
    <div className={`App ${getBackgroundClass(weatherData?.current?.condition?.text || '')}`}>
      <h1 className="app-title">WeatherWise 🌦️</h1>

      <div className="weather-app-container">
        <form onSubmit={getWeather} className="weather-form">
          <input
            type="text"
            placeholder="Enter city name"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            className="city-input"
          />
          <button type="submit" className="submit-button">Get Weather</button>
        </form>

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Fetching weather data...</p>
          </div>
        )}
        {error && <p className="error-message">{error}</p>}

        {weatherData && !loading && !error && (
          <div className="weather-display fadeIn">
            {/* Ab hum aapke original API response ke structure ko use kar rahe hain */}
            <h2 className="city-name">{weatherData.location.name}, {weatherData.location.country}</h2>
            <div className="weather-details">
              <div className="temp-section">
                <p className="temperature">{Math.round(weatherData.current.temp_c)}°C</p>
                {/* Agar icon URL available hai */}
                {weatherData.current.condition.icon && (
                  <img
                    src={weatherData.current.condition.icon} // Direct icon URL from your API
                    alt={weatherData.current.condition.text}
                    className="weather-icon"
                  />
                )}
              </div>
              <p className="condition">{weatherData.current.condition.text}</p>
              <div className="additional-info">
                <p>Feels like: <span>{Math.round(weatherData.current.feelslike_c)}°C</span></p>
                <p>Humidity: <span>{weatherData.current.humidity}%</span></p>
                <p>Wind: <span>{weatherData.current.wind_kph} km/h</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;