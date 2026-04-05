import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './i18n'; // Initialize i18n
import { useLanguage } from './hooks/useLanguage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import CropInfo from './pages/CropInfo';
import Weather from './pages/Weather';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';
import ChatbotIcon from './components/Chatbot/ChatbotIcon';
import ChatWindow from './components/Chatbot/ChatWindow';
import './styles/index.css';

function App() {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const preferredLanguage = localStorage.getItem('preferredLanguage');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }

    // Set language preference
    if (preferredLanguage) {
      changeLanguage(preferredLanguage);
    }

    setLoading(false);

    // Listen for chat open event from dashboard
    const handleOpenChat = () => {
      setChatOpen(true);
    };
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    // Set language from user data if available
    if (userData.language) {
      changeLanguage(userData.language);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    // Update language if changed
    if (updatedUser.language && updatedUser.language !== currentLanguage) {
      changeLanguage(updatedUser.language);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <Router>
      {isAuthenticated && (
        <nav className="navbar">
          <div className="navbar-content">
            <div className="navbar-brand">🌾 Smart Agriculture</div>
            <ul className="nav-links">
              <li><Link to="/dashboard">{t('nav.dashboard')}</Link></li>
              <li><Link to="/disease">{t('nav.disease')}</Link></li>
              <li><Link to="/crops">{t('nav.crops')}</Link></li>
              <li><Link to="/weather">{t('nav.weather')}</Link></li>
              <li><Link to="/reminders">{t('nav.tasks')}</Link></li>
              <li><a href="#chat" onClick={() => setChatOpen(true)} style={{ cursor: 'pointer' }}>{t('nav.chat')}</a></li>
              <li><Link to="/settings">{t('nav.settings')}</Link></li>
              <li><a href="#logout" onClick={handleLogout}>{t('nav.logout')}</a></li>
            </ul>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/disease" element={isAuthenticated ? <DiseaseDetection /> : <Navigate to="/login" />} />
        <Route path="/crops" element={isAuthenticated ? <CropInfo /> : <Navigate to="/login" />} />
        <Route path="/crops/:cropName" element={isAuthenticated ? <CropInfo /> : <Navigate to="/login" />} />
        <Route path="/weather" element={isAuthenticated ? <Weather /> : <Navigate to="/login" />} />
        <Route path="/reminders" element={isAuthenticated ? <Reminders /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings user={user} onUpdate={handleUpdateUser} /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>

      {/* Chatbot Components */}
      {isAuthenticated && (
        <>
          <ChatbotIcon
            isOpen={chatOpen}
            onClick={() => setChatOpen(!chatOpen)}
          />
          <ChatWindow
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            userLocation={user?.location}
          />
        </>
      )}
    </Router>

  );
}

export default App;
