# Quick Start Guide - Smart Agriculture Assistant

## Step 1: Clone/Download the Project

Download the project files to your local machine.

## Step 2: Set Up MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Click "Sign up"
3. Create your account
4. Create a new cluster (free tier is fine)
5. Create a database user:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `admin`
   - Password: (create a strong password, save it!)
   - Role: `Atlas Admin`
6. Whitelist your IP:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (for development)
7. Get connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

Your connection string should look like:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agriculture_db?retryWrites=true&w=majority
```

## Step 3: Get OpenWeatherMap API Key

1. Go to [openweathermap.org](https://openweathermap.org)
2. Click "Sign Up"
3. Fill in the signup form
4. Verify your email
5. Go to "API keys" tab
6. Copy your default API key

## Step 4: Backend Setup

### Windows/Mac/Linux:

1. Open terminal/command prompt
2. Navigate to backend folder:
   ```bash
   cd smart-agriculture-app/backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create `.env` file in backend folder with:
   ```
   MONGO_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agriculture_db?retryWrites=true&w=majority
   JWT_SECRET=mysupersecretkeythatshouldbeverylongandcomplex123456
   WEATHER_API_KEY=your_openweathermap_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

   You should see:
   ```
   Server running on http://localhost:5000
   MongoDB connected successfully
   Crops data loaded successfully
   ```

**Keep this terminal running!**

## Step 5: Frontend Setup

1. **Open a NEW terminal/command prompt** (keep the backend running)

2. Navigate to frontend folder:
   ```bash
   cd smart-agriculture-app/frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create `.env` file (optional):
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. Start the frontend:
   ```bash
   npm start
   ```

   This will automatically open your browser at `http://localhost:3000`

## Step 6: Test the Application

### Create an Account
1. Click "Sign up"
2. Enter details:
   - Name: `John Farmer`
   - Email: `john@example.com`
   - Password: `password123`
3. Optionally add location and farm size
4. Click "Sign Up"

### Test Disease Detection
1. Go to "Disease Detection" page
2. Click upload area or drag & drop an image
3. Click "Analyze Image"
4. You'll see a mock disease detection result

### Test Disease Detection (with real images)
- Try uploading images of:
  - Plant leaves
  - Trees
  - Flowers
- See how the system responds!

### Test Crop Information
1. Go to "Crop Info"
2. Try searching for "Wheat"
3. Click on a crop to see details
4. Try filtering by soil type

### Test Weather
1. Go to "Weather" page
2. Enter a city name: `Delhi`
3. See weather and 24-hour forecast
4. Try another city: `New York`, `Tokyo`, etc.

### Test Task Management
1. Go to "Tasks"
2. Click "+ Add Task"
3. Fill in:
   - Crop: `Wheat`
   - Task: `Crop sowing`
   - Date: (select a date)
   - Priority: `High`
4. Click "Save Task"
5. Try changing status or deleting

## Troubleshooting

### Backend won't start

**Error: "Cannot find module"**
```bash
cd backend
npm install
```

**Error: "MongoDB connection failed"**
- Check your MONGO_URI in `.env` is correct
- Verify your IP is whitelisted in MongoDB Atlas
- Check username/password in connection string

**Error: "Weather API not working"**
- Verify your OpenWeatherMap API key is correct
- Wait 10 minutes after creating API key (it needs time to activate)

### Frontend won't start

**Error: "Port 3000 already in use"**
```bash
# Kill the process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

**White screen or blank page**
- Check browser console for errors (F12)
- Clear browser cache
- Ensure backend is running on port 5000

### API errors in frontend

**"Network Error" when logging in**
- Ensure backend is running (`npm start` in backend folder)
- Check `.env` MONGO_URI is correct
- Check backend console for errors

**Disease detection not working**
- Backend must be running
- File must be an image (JPG, PNG, GIF)
- File size must be under 5MB

## Next Steps

1. **Customize the application:**
   - Change colors in `frontend/src/styles/index.css`
   - Modify the crops CSV in `backend/data/crops.csv`
   - Add your own disease detection model

2. **Deploy the application:**
   - Deploy backend to: Heroku, Railway, or AWS
   - Deploy frontend to: Netlify, Vercel, or GitHub Pages
   - Use MongoDB Atlas (already cloud-hosted)

3. **Add more features:**
   - Soil testing recommendations
   - Market price information
   - Community forum
   - Mobile app

## Production Deployment

### Backend (Heroku example)

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set MONGO_URI=...`
5. Deploy: `git push heroku main`

### Frontend (Netlify example)

1. Build: `npm run build`
2. Deploy `build` folder to Netlify
3. Set environment variable: `REACT_APP_API_URL=your_backend_url`

## Support & Help

- 📖 Read the full README.md for API documentation
- 🐛 Check browser console (F12) for error messages
- 📝 Review code comments for implementation details

---

**Happy Farming!** 🌾🚜
