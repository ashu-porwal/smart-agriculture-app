import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { weatherAPI, cropsAPI } from '../services/api';

function Weather() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchedCity, setSearchedCity] = useState('');


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      /*const [weatherResponse, forecastResponse] = await Promise.all([
        weatherAPI.getWeather(city),
        weatherAPI.getForecast(city),
      ]);

      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data.forecast);*/
      const [weatherData, forecastData] = await Promise.all([
        weatherAPI.getWeather(city),
        weatherAPI.getForecast(city),
      ]);

      setWeather(weatherData);
      setForecast(forecastData);

      const cropsResponse = await cropsAPI.getAllCrops();
      const cropsList = cropsResponse.data.crops;

      const recommended = recommendCrops(weatherData, cropsList);

      setRecommendedCrops(recommended);

      setSearchedCity(city);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch weather data');
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherType) => {
    if(!weatherType) return '🌤️'; //prevents crash

    const type = weatherType.toLowerCase();
    if (type.includes('rain')) return '🌧️';
    if (type.includes('cloud')) return '☁️';
    if (type.includes('sunny') || type.includes('clear')) return '☀️';
    if (type.includes('snow')) return '❄️';
    if (type.includes('wind')) return '💨';
    return '🌤️';
  };

  const recommendCrops = (weatherData, crops) => {
    if (!weatherData || crops.length === 0) return [];

    const temp = weatherData.temperature;
    const humidity = weatherData.humidity;

    return crops.filter((crop) => {
      const range = crop.temperature_range.replace("°C", "").split("-");
      const minTemp = parseInt(range[0]);
      const maxTemp = parseInt(range[1]);

      const tempMatch = temp >= minTemp && temp <= maxTemp;

      let moistureMatch = true;
      if (crop.moisture_requirement === "High" && humidity < 60) moistureMatch = false;
      if (crop.moisture_requirement === "Low" && humidity > 70) moistureMatch = false;

      return tempMatch && moistureMatch;
    });
 };

  const getCropIcon = (name) => {
    if (!name) return "🌱"; // prevents crash
    const crop = name.toLowerCase();

    // Grains
  if (crop.includes("rice")) return "🌾";
  if (crop.includes("wheat")) return "🌾";
  if (crop.includes("corn") || crop.includes("maize")) return "🌽";
  if (crop.includes("barley")) return "🌾";

  // Vegetables
  if (crop.includes("tomato")) return "🍅";
  if (crop.includes("potato")) return "🥔";
  if (crop.includes("onion")) return "🧅";
  if (crop.includes("carrot")) return "🥕";
  if (crop.includes("cabbage")) return "🥬";
  if (crop.includes("spinach")) return "🥬";
  if (crop.includes("brinjal") || crop.includes("eggplant")) return "🍆";
  if (crop.includes("capsicum") || crop.includes("pepper")) return "🌶️";
  if (crop.includes("cucumber")) return "🥒";
  if (crop.includes("pumpkin")) return "🎃";

  // Fruits
  if (crop.includes("banana")) return "🍌";
  if (crop.includes("mango")) return "🥭";
  if (crop.includes("papaya")) return "🍈";
  if (crop.includes("guava")) return "🍏";
  if (crop.includes("pomegranate")) return "🍎";
  if (crop.includes("watermelon")) return "🍉";

  // Pulses & Oil crops
  if (crop.includes("soybean")) return "🌿";
  if (crop.includes("chickpea")) return "🌿";
  if (crop.includes("lentil")) return "🌿";
  if (crop.includes("pea")) return "🟢";
  if (crop.includes("groundnut")) return "🥜";
  if (crop.includes("mustard")) return "🌼";
  if (crop.includes("sunflower")) return "🌻";

  // Cash crops
  if (crop.includes("cotton")) return "💭";
  if (crop.includes("sugarcane")) return "🎋";
  if (crop.includes("turmeric")) return "🟡";

  return "🌱"; // fallback
  };


  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ marginBottom: '2rem', color: '#2ecc71' }}>🌤️ Weather Dashboard</h1>

        <div className="card" style={{ maxWidth: '500px', marginBottom: '2rem' }}>
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name (e.g., Delhi, London, Tokyo)"
                style={{ flex: 1 }}
              />
              <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem' }}>
                {loading ? '...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        )}

        {weather && (
          <div>
            {/* Top grid (only 2 itmes) */}
            <div style ={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}>
              {/* Current Weather */}
              <div className="card" style={{ height : '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    {getWeatherIcon(weather.description)}
                  </div>
                  <h2 style={{ color: '#2ecc71', marginBottom: '0.5rem' }}>{weather.city}</h2>
                  <p style={{ color: '#666', fontStyle: 'italic' }}>
                    {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                  </p>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '4px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <strong>🌡️ Temperature</strong>
                      <p style={{ fontSize: '1.5rem', color: '#2ecc71', marginTop: '0.25rem' }}>
                        {weather.temperature}°C
                      </p>
                    </div>

                    <div>
                      <strong>💧 Humidity</strong>
                      <p style={{ fontSize: '1.5rem', color: '#3498db', marginTop: '0.25rem' }}>
                        {weather.humidity}%
                      </p>
                    </div>

                    <div>
                      <strong>💨 Wind Speed</strong>
                      <p style={{ fontSize: '1.5rem', color: '#9b59b6', marginTop: '0.25rem' }}>
                        {weather.wind_speed} m/s
                      </p>
                    </div>

                    <div>
                      <strong>🔁 Pressure</strong>
                      <p style={{ fontSize: '1.5rem', color: '#e67e22', marginTop: '0.25rem' }}>
                        {weather.pressure} hPa
                      </p>
                    </div>

                    <div>
                      <strong>☁️ Clouds</strong>
                      <p style={{ fontSize: '1.5rem', color: '#95a5a6', marginTop: '0.25rem' }}>
                        {weather.clouds}%
                      </p>
                    </div>

                    <div>
                      <strong>🌅 Sunrise</strong>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                        {new Date(weather.sunrise).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Crops */}
              {recommendedCrops.length > 0 && (
                <div className="card" style={{ marginTop: '2rem' }}>
                  <div className="card-title"> 🌱 Recommended Crops</div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem'
                  }}>
                    {recommendedCrops.slice(0, 6).map((crop, index) => (
                      <div key={index} style={{
                        textAlign: 'center',
                        padding: '1rem',
                        background: '#f0fdf4',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }} onClick={() => navigate(`/crops/${crop.crop_name}`)}
                      >
                        <div style={{ fontSize: '1.5rem' }}>
                          {getCropIcon(crop.crop_name)}
                        </div>
                        <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                          {crop.crop_name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>

            {/* Forecast */}
            {forecast.length > 0 && (
              <div className="card">
                <div className="card-title">📅 24-Hour Forecast</div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  {forecast.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '4px',
                      }}
                    >
                      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                        {new Date(item.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {getWeatherIcon(item.weather || "")}
                      </div>
                      <p style={{ fontWeight: 'bold', color: '#2ecc71', marginBottom: '0.25rem' }}>
                        {item.temperature}°C
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#666' }}>
                        💧 {item.humidity}%
                      </p>
                      {item.rainfall > 0 && (
                        <p style={{ fontSize: '0.75rem', color: '#3498db' }}>
                          🌧️ {item.rainfall}mm
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farming Tips */}
            <div className="card" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #2ecc71' }}>
              <div className="card-title">💡 Farming Tips</div>
              <ul style={{ lineHeight: '1.8' }}>
                {weather.humidity > 80 && (
                  <li>High humidity detected - Watch for fungal diseases. Ensure good ventilation.</li>
                )}
                {weather.humidity < 30 && (
                  <li>Low humidity - Increase irrigation frequency. Monitor plants closely.</li>
                )}
                {weather.wind_speed > 5 && (
                  <li>Strong wind conditions - Secure fragile plants and reduce pesticide spraying.</li>
                )}
                {weather.rainfall > 0 && (
                  <li>Rain expected - Delay fertilizer application until after rainfall.</li>
                )}
                {weather.temperature > 35 && (
                  <li>High temperature - Increase irrigation and mulching to retain soil moisture.</li>
                )}
                {weather.temperature < 15 && (
                  <li>Low temperature - Some crops may grow slowly. Check temperature tolerance.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {!weather && !loading && (
          <div className="card" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ color: '#999' }}>Enter a city name to view weather information</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;
