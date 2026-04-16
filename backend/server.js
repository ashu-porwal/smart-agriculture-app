/*require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const { router: cropsRoutes, initializeCropsData } = require('./routes/crops');
const weatherRoutes = require('./routes/weather');
const diseaseRoutes = require('./routes/disease');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Initialize crops data
initializeCropsData();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
*/

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const tasksRoutes = require('./routes/tasks');
const { router: cropsRoutes, initializeCropsData } = require('./routes/crops');
const weatherRoutes = require('./routes/weather');
const diseaseRoutes = require('./routes/disease');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Initialize crops data
initializeCropsData();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiKeys: {
      groq: process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Missing',
      weather: process.env.WEATHER_API_KEY ? '✅ Configured' : '❌ Missing',
      mongo: process.env.MONGO_URI ? '✅ Configured' : '❌ Missing',
    },
  });
});

// Chatbot service status endpoint
app.get('/api/chatbot/status', (req, res) => {
  res.json({
    service: 'Chatbot AI Service',
    status: 'operational',
    ai_provider: 'Groq API',
    model: 'llama-3.3-70b-versatile',
    fallback_enabled: true,
    features: [
      'Automatic retry with exponential backoff',
      'Offline fallback responses',
      'Request timeout protection (30s)',
      'Confidence validation',
      'Error recovery',
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌾 Smart Agriculture App Backend`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📋 Available APIs:`);
  console.log(`   - GET  /api/health              (Health check)`);
  console.log(`   - GET  /api/chatbot/status      (Service status)`);
  console.log(`   - POST /api/chatbot             (Chat with AI)`);
  console.log(`   - GET  /api/weather/:city       (Weather data)`);
  console.log(`   - GET  /api/weather/recommend/:city (Crop recommendations)`);
  console.log(`   - POST /api/disease/detect      (Disease detection)\n`);
});
