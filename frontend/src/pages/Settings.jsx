import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { LANGUAGES, useLanguage } from '../hooks/useLanguage';

function Settings({ user, onUpdate }) {
  const navigate = useNavigate();
  const { changeLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', or 'language'

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    location: user?.location || '',
    farmSize: user?.farmSize || 0,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Language form state
  const [languageForm, setLanguageForm] = useState({
    language: user?.language || 'en',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (e) => {
    setLanguageForm({ language: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(
        profileForm.name,
        profileForm.location,
        parseFloat(profileForm.farmSize) || 0,
        profileForm.mobile,
        languageForm.language
      );

      const updatedUser = response.data.user;
      onUpdate(updatedUser);
      setSuccess('Profile updated successfully!');

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(
        profileForm.name,
        profileForm.location,
        parseFloat(profileForm.farmSize) || 0,
        profileForm.mobile,
        languageForm.language
      );

      const updatedUser = response.data.user;
      onUpdate(updatedUser);
      changeLanguage(languageForm.language);
      setSuccess('Language updated successfully!');

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update language');
    } finally {
      setLoading(false);
    }
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

        <h1 style={{ marginBottom: '2rem', color: '#2ecc71' }}>⚙️ Settings</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Tab Navigation */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #eee', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                backgroundColor: activeTab === 'profile' ? '#2ecc71' : 'transparent',
                color: activeTab === 'profile' ? 'white' : '#666',
                fontWeight: activeTab === 'profile' ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: activeTab === 'profile' ? '3px solid #2ecc71' : 'none',
                fontSize: '1rem',
              }}
            >
              👤 Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('password')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                backgroundColor: activeTab === 'password' ? '#2ecc71' : 'transparent',
                color: activeTab === 'password' ? 'white' : '#666',
                fontWeight: activeTab === 'password' ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: activeTab === 'password' ? '3px solid #2ecc71' : 'none',
                fontSize: '1rem',
              }}
            >
              🔐 Change Password
            </button>
            <button
              onClick={() => setActiveTab('language')}
              style={{
                padding: '1rem 2rem',
                border: 'none',
                backgroundColor: activeTab === 'language' ? '#2ecc71' : 'transparent',
                color: activeTab === 'language' ? 'white' : '#666',
                fontWeight: activeTab === 'language' ? 'bold' : 'normal',
                cursor: 'pointer',
                borderBottom: activeTab === 'language' ? '3px solid #2ecc71' : 'none',
                fontSize: '1rem',
              }}
            >
              🌐 Change Language
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '2rem', color: '#333' }}>Edit Your Profile</h2>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={profileForm.email}
                  disabled
                  placeholder="Email (cannot be changed)"
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number</label>
                <input
                  id="mobile"
                  type="tel"
                  name="mobile"
                  value={profileForm.mobile}
                  onChange={handleProfileChange}
                  placeholder="+91 XXXXX XXXXX"
                  pattern="[0-9+\s\-\(\)]+"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  name="location"
                  value={profileForm.location}
                  onChange={handleProfileChange}
                  placeholder="City/Region"
                />
              </div>

              <div className="form-group">
                <label htmlFor="farmSize">Farm Size (in acres)</label>
                <input
                  id="farmSize"
                  type="number"
                  name="farmSize"
                  value={profileForm.farmSize}
                  onChange={handleProfileChange}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '2rem', color: '#333' }}>Change Password</h2>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <input
                  id="currentPassword"
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your current password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter new password (min 6 characters)"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm your new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '2rem', color: '#333' }}>🌐 Change Language</h2>

            <form onSubmit={handleLanguageSubmit}>
              <div className="form-group">
                <label htmlFor="language">Select Your Language</label>
                <select
                  id="language"
                  value={languageForm.language}
                  onChange={handleLanguageChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Select your preferred language. The entire website will switch to your chosen language after you save.
              </p>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Updating Language...' : 'Update Language'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
