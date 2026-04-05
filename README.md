# Smart Agriculture Assistant

A full-stack web application designed to help farmers identify crop diseases, access crop information, check weather conditions, and manage farming tasks.

## Features

✨ **Comprehensive Farming Management**

- 🔐 **Secure Authentication** - JWT-based login/signup with password hashing
- 🔍 **Disease Detection** - Upload leaf images and get instant disease identification
- 🌾 **Crop Information** - Browse detailed crop data with search and filtering
- 🌤️ **Weather Dashboard** - Real-time weather and 24-hour forecasts
- 📋 **Task Management** - Create and track farming tasks with reminders

## Tech Stack

### Frontend
- React.js 18
- React Router for navigation
- Axios for API communication
- Responsive CSS Grid/Flexbox

### Backend
- Node.js + Express.js
- MongoDB Atlas (cloud database)
- JWT for authentication
- Multer for image uploads
- CSV Parser for crop data

### APIs
- OpenWeatherMap API for weather data
- Multer for image processing

## Project Structure

```
smart-agriculture-app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── crops.js
│   │   ├── weather.js
│   │   ├── disease.js
│   │   └── tasks.js
│   ├── middleware/
│   │   └── authenticate.js
│   ├── data/
│   │   └── crops.csv
│   ├── server.js
│   └── .env
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── DiseaseDetection.jsx
    │   │   ├── CropInfo.jsx
    │   │   ├── Weather.jsx
    │   │   └── Reminders.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── index.js
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js 14+
- MongoDB Atlas account
- OpenWeatherMap API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/agriculture_db
JWT_SECRET=your_super_secret_key_min_32_chars_recommended
WEATHER_API_KEY=your_openweathermap_api_key
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost:5000):
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Getting API Keys

### OpenWeatherMap API
1. Visit [openweathermap.org](https://openweathermap.org)
2. Sign up for a free account
3. Go to API keys section
4. Copy your API key to `.env`

### MongoDB Atlas
1. Visit [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get the connection string
5. Add your IP to the whitelist
6. Copy the URI to `.env`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Crops
- `GET /api/crops` - Get all crops
- `GET /api/crops?search=wheat` - Search crops
- `GET /api/crops/:cropName` - Get crop details

### Weather
- `GET /api/weather/:city` - Get current weather
- `GET /api/weather/forecast/:city` - Get 24-hour forecast

### Tasks
- `POST /api/tasks` - Create task (requires auth)
- `GET /api/tasks` - Get user tasks (requires auth)
- `PUT /api/tasks/:taskId` - Update task (requires auth)
- `DELETE /api/tasks/:taskId` - Delete task (requires auth)

### Disease Detection
- `POST /api/disease/detect` - Upload image for disease detection (requires auth)
- `GET /api/disease/:filename` - Get uploaded image

## Usage Guide

### 1. Create Account
- Navigate to signup page
- Enter name, email, password
- Optional: Add location and farm size
- Click "Sign Up"

### 2. Disease Detection
- Go to "Disease Detection" page
- Upload or capture a leaf image
- Click "Analyze Image"
- Get disease diagnosis with confidence and recommendations

### 3. Browse Crops
- Visit "Crop Info" page
- Search by crop name or filter by soil type
- Click on a crop to see detailed information

### 4. Check Weather
- Go to "Weather" page
- Enter a city name
- View current conditions and 24-hour forecast
- Get farming tips based on weather

### 5. Manage Tasks
- Click "Tasks" in navigation
- Click "+ Add Task" to create
- Fill in crop name, task type, date, priority
- Mark Complete/Delete as needed

## Mobile Responsiveness

The application is fully responsive and mobile-friendly:
- Touch-friendly buttons and forms
- Optimized for small screens
- Mobile-ready image upload
- Weather dashboard adapts to narrow screens

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Private routes protection
- CORS enabled for cross-origin requests
- Input validation
- Secure file upload with type checking

## Troubleshooting

### "Cannot find mongo" error
- Ensure MongoDB Atlas URI is correct in `.env`
- Check that your IP is whitelisted in MongoDB Atlas

### CORS errors
- Backend should have `cors` package installed
- Check `server.js` has `app.use(cors())`

### Weather API not working
- Verify OpenWeatherMap API key is valid
- Check API key quotas haven't been exceeded

### Image upload fails
- Check file size is under 5MB
- Ensure file is a valid image format
- Verify `uploads` directory exists

## Future Enhancements

- 🤖 Integrate real ML model for disease detection
- 📊 Add analytics dashboard with trends
- 🔔 Push notifications for reminders
- 🗺️ Map view for farm locations
- 📱 Native mobile app (React Native)
- 🌍 Multi-language support
- 📞 SMS alerts for urgent tasks

## Contributing

Feel free to fork, submit issues, and create pull requests!

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check MongoDB and OpenWeatherMap documentation
4. Open an issue on GitHub

---

Happy farming! 🌾
