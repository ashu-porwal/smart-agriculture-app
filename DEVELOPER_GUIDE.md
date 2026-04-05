# Developer Quick Reference

## Project at a Glance

**Smart Agriculture Assistant** - A React + Node.js + MongoDB web app for farmers

## Quick Commands

```bash
# Setup
./setup.sh                    # Mac/Linux
setup.bat                     # Windows

# Backend
cd backend && npm install
cd backend && npm start       # Production
cd backend && npm run dev     # Development (requires nodemon)

# Frontend
cd frontend && npm install
cd frontend && npm start
cd frontend && npm run build
```

## File Locations

| Feature | Backend | Frontend |
|---------|---------|----------|
| Auth | routes/auth.js | pages/Login.jsx, Signup.jsx |
| Weather | routes/weather.js | pages/Weather.jsx |
| Crops | routes/crops.js | pages/CropInfo.jsx |
| Disease | routes/disease.js | pages/DiseaseDetection.jsx |
| Tasks | routes/tasks.js | pages/Reminders.jsx |
| Dashboard | - | pages/Dashboard.jsx |
| API Calls | - | services/api.js |
| Styling | - | styles/index.css |

## Environment Variables Needed

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
WEATHER_API_KEY=your_api_key
PORT=5000
```

## API Base URLs

```
Backend: http://localhost:5000
Frontend: http://localhost:3000
API: http://localhost:5000/api
```

## Database Collections

- `users` - User accounts
- `tasks` - Farm tasks

## Common Edits

### Change Theme Color
Edit `frontend/src/styles/index.css`:
- Find `#2ecc71` (green)
- Replace with your color

### Add More Crops
Edit `backend/data/crops.csv`:
- Add row with: crop_name, soil_type, temperature_range, best_month, moisture_requirement, water_requirement, fertilizer_recommendation

### Change Disease Detection Model
Edit `backend/routes/disease.js`:
- Replace `detectDisease()` function with real ML model

### Customize Tasks
Edit `backend/models/Task.js`:
- Modify default task types in `taskName` enum

## Deployment Links

- Heroku: https://www.heroku.com
- Railway: https://railway.app
- Netlify: https://www.netlify.com
- Vercel: https://vercel.com
- MongoDB Atlas: https://mongodb.com/cloud/atlas

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process or use different port |
| MongoDB won't connect | Verify URI and whitelist IP |
| API not responding | Check backend is running on :5000 |
| Images not uploading | Check uploads folder permissions |
| Weather API fails | Verify API key and rate limits |

## Key Files to Understand

1. `backend/server.js` - Main server setup
2. `frontend/App.jsx` - Routing configuration
3. `backend/middleware/authenticate.js` - Auth logic
4. `frontend/services/api.js` - API calls
5. `frontend/pages/*.jsx` - UI components

## Testing

```bash
# Login credentials (test)
Email: john@example.com
Password: password123

# Test Cities
Delhi, New York, London, Tokyo, Sydney

# Test Crops
Wheat, Rice, Corn, Tomato, Potato
```

## Important Libraries

| Library | Purpose |
|---------|---------|
| express | Server framework |
| mongoose | Database ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT tokens |
| multer | File uploads |
| axios | HTTP client |
| react-router | Navigation |

---

**For detailed info, see README.md**

