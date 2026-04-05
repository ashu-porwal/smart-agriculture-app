import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (name, email, password, location = '', farmSize = 0, mobile = '', language = 'en') =>
    api.post('/auth/signup', { name, email, password, location, farmSize, mobile, language }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getProfile: () =>
    api.get('/auth/profile'),
  updateProfile: (name, location, farmSize, mobile, language) =>
    api.put('/auth/profile', { name, location, farmSize, mobile, language }),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Tasks API
export const tasksAPI = {
  createTask: (cropName, taskName, taskDate, description = '', priority = 'Medium') =>
    api.post('/tasks', { cropName, taskName, taskDate, description, priority }),
  getTasks: () =>
    api.get('/tasks'),
  updateTask: (taskId, status) =>
    api.put(`/tasks/${taskId}`, { status }),
  deleteTask: (taskId) =>
    api.delete(`/tasks/${taskId}`),
};

// Crops API
export const cropsAPI = {
  getAllCrops: (search = '', soilType = '') =>
    api.get('/crops', { params: { search, soilType } }),
  getCropDetail: (cropName) =>
    api.get(`/crops/${cropName}`),
};

// Weather API
/*export const weatherAPI = {
  getWeather: (city) =>
    api.get(`/weather/${city}`),
  getForecast: (city) =>
    api.get(`/weather/forecast/${city}`),
};*/
export const weatherAPI = {
  getWeather: async (city) => {
    const API_KEY = "0fc82a863e64f64e95dda28660dd142e";

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    const data = await res.json();
    console.log("Weather API response:", data); 
    if (data.cod !== 200) {
    throw new Error(data.message);
    }

    return {
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      clouds: data.clouds.all,
      description: data.weather[0].description,
      sunrise: data.sys.sunrise * 1000,
      rainfall: data.rain?.["1h"] || 0
    };
  },

  /*getForecast: async (city) => {
    const API_KEY = "0fc82a863e64f64e95dda28660dd142e";

    const res = await fetch(
      `http://api.openweathermap.org/data/2.5/forecast?id=524901&appid={API key}`
    );

    const data = await res.json();

    // take first 8 entries (24 hours, every 3 hours)
    const forecast = data.list.slice(0, 8).map(item => ({
      date: item.dt * 1000,
      temperature: item.main.temp,
      humidity: item.main.humidity,
      weather: item.weather[0].description,
      rainfall: item.rain?.["3h"] || 0
    }));

    return forecast;

  }*/
  getForecast: async (city) => {
  const API_KEY = "0fc82a863e64f64e95dda28660dd142e";

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );

  const data = await res.json();

  console.log("Forecast API:", data); // debug

  // 🔥 check if data exists
  if (!data.list) {
    throw new Error(data.message || "Forecast not available");
  }

  const forecast = data.list.slice(0, 8).map(item => ({
    date: item.dt * 1000,
    temperature: item.main.temp,
    humidity: item.main.humidity,
    weather: item.weather[0].description,
    rainfall: item.rain?.["3h"] || 0
  }));

  return forecast;
  }
};

// Disease Detection API
/*export const diseaseAPI = {
  detectDisease: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/disease/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getImage: (filename) =>
    `${API_URL}/disease/${filename}`,
};*/

// Disease Detection API
/*export const diseaseAPI = {
  detectDisease: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/disease/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getImage: (filename) =>
    `${API_URL}/disease/${filename}`,
};*/

export const diseaseAPI = {
  detectDisease: async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile); // MUST match Flask

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message, context = {}) =>
    api.post('/chatbot', { message, context }),
  getChatHistory: (limit = 20) =>
    api.get('/chatbot/history', { params: { limit } }),
  submitFeedback: (chatId, feedback, reason = '') =>
    api.post(`/chatbot/${chatId}/feedback`, { feedback, reason }),
};

export default api;

