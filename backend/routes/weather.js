const express = require('express');
const axios = require('axios');

const router = express.Router();

// Get weather by city
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric',
      },
    });

    const {
      main: { temp, humidity, pressure },
      wind: { speed },
      clouds,
      description: weather_description,
      sys: { sunrise, sunset },
    } = response.data;

    res.json({
      city: response.data.name,
      temperature: temp,
      humidity,
      wind_speed: speed,
      pressure,
      clouds: clouds.all,
      weather: response.data.weather[0].main,
      description: response.data.weather[0].description,
      sunrise: new Date(sunrise * 1000),
      sunset: new Date(sunset * 1000),
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(500).json({ message: 'Error fetching weather', error: error.message });
  }
});

// Get weather forecast
router.get('/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: city,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric',
      },
    });

    const forecast = response.data.list.map((item) => ({
      date: new Date(item.dt * 1000),
      temperature: item.main.temp,
      humidity: item.main.humidity,
      weather: item.weather[0].main,
      description: item.weather[0].description,
      wind_speed: item.wind.speed,
      rainfall: item.rain?.['3h'] || 0,
    }));

    res.json({
      city: response.data.city.name,
      forecast: forecast.slice(0, 8), // Next 24 hours
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(500).json({ message: 'Error fetching weather forecast', error: error.message });
  }
});

module.exports = router;
