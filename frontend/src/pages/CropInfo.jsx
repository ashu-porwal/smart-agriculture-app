import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cropsAPI } from '../services/api';

function CropInfo() {
  const navigate = useNavigate();
  const { cropName } = useParams();
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [soilFilter, setSoilFilter] = useState('');
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    if(cropName) {
      fetchSingleCrop(cropName);
    }
    else {
      fetchCrops();
    }
  }, [cropName]);

  const fetchSingleCrop = async (name) => {
    try {
      setLoading(true);
      const res = await cropsAPI.getCropDetail(name);
      setSelectedCrop(res.data);
    } catch (err) {
      setError("Crop not found");
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropsAPI.getAllCrops();
      setCrops(response.data.crops);
      setFilteredCrops(response.data.crops);
    } catch (err) {
      setError('Failed to fetch crop information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = crops;

    if (searchTerm) {
      filtered = filtered.filter((crop) =>
        crop.crop_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (soilFilter) {
      filtered = filtered.filter((crop) =>
        crop.soil_type.toLowerCase().includes(soilFilter.toLowerCase())
      );
    }

    setFilteredCrops(filtered);
  }, [searchTerm, soilFilter, crops]);

  const soilTypes = [...new Set(crops.map((c) => c.soil_type))].sort();


  const getCropIcon = (name) => {
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
        <h1 style={{ marginBottom: '2rem', color: '#2ecc71' }}>🌾 Crop Information Database</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="search">Search Crop</label>
              <input
                id="search"
                type="text"
                placeholder="e.g., Wheat, Rice, Tomato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="soil">Filter by Soil Type</label>
              <select
                id="soil"
                value={soilFilter}
                onChange={(e) => setSoilFilter(e.target.value)}
              >
                <option value="">All Soil Types</option>
                {soilTypes.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : selectedCrop ? (
          <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button
              onClick={() => setSelectedCrop(null)}
              className="btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ← Back to List
            </button>

            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              {getCropIcon(selectedCrop.crop_name)}
            </div>

            <h2 style={{ color: '#2ecc71', marginBottom: '1.5rem' }}>{selectedCrop.crop_name}</h2>

            <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong>Soil Type:</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>{selectedCrop.soil_type}</p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Temperature Range:</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>{selectedCrop.temperature_range}</p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Best Planting Month:</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>{selectedCrop.best_month}</p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Moisture Requirement:</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>{selectedCrop.moisture_requirement}</p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Water Requirement:</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>{selectedCrop.water_requirement}</p>
              </div>

              <div>
                <strong>Fertilizer Recommendation:</strong>
                <p style={{ color: '#666', marginTop: '0.25rem' }}>{selectedCrop.fertilizer_recommendation}</p>
              </div>
            </div>
          </div>
        ) : filteredCrops.length > 0 ? (
          <>
            <div style={{ marginBottom: '1rem', color: '#666' }}>
              Showing {filteredCrops.length} of {crops.length} crops
            </div>

            <div className="card-grid">
              {filteredCrops.map((crop) => (
                <div
                  key={crop.crop_name}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {getCropIcon(crop.crop_name)}
                  </div>

                  <h3 style={{ color: '#2ecc71', marginBottom: '0.5rem' }}>{crop.crop_name}</h3>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <p>
                      <strong>Soil:</strong> {crop.soil_type}
                    </p>
                    <p>
                      <strong>Temperature:</strong> {crop.temperature_range}
                    </p>
                    <p>
                      <strong>Best Month:</strong> {crop.best_month}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ color: '#999' }}>No crops found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CropInfo;
