import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { diseaseAPI } from '../services/api';

function DiseaseDetection() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [detection, setDetection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

 /* const result = await diseaseAPI.detectDisease(file);

    setDetection(`
    Crop: ${result.crop}
    Disease: ${result.disease}
    Confidence: ${result.confidence}%

    Treatment: ${result.treatment}
    Precaution: ${result.precaution}
  `);*/

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDetect = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      //const response = await diseaseAPI.detectDisease(selectedImage);
      //setDetection(response.data.detection);
      const result = await diseaseAPI.detectDisease(selectedImage);
      setDetection({
        crop: result.crop,
        disease: result.disease,
        confidence: result.confidence + "%",
        treatment: result.treatment,
        precaution: result.precaution
      });

      setSuccess('Disease detection completed!');
      setSelectedImage(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error detecting disease');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAnother = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setDetection(null);
    setError('');
    setSuccess('');
    fileInputRef.current?.click();
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
        <h1 style={{ marginBottom: '2rem', color: '#2ecc71' }}>🔍 Crop Disease Detection</h1>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card">
            <div className="card-title">Upload Leaf Image</div>

            {!imagePreview ? (
              <div
                className={`upload-area ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  capture="environment"
                />
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📸</div>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Drag and drop your leaf image here
                </p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  or click to select from your device
                </p>
                <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '1rem' }}>
                  Supported formats: JPG, PNG, GIF (Max 5MB)
                </p>
              </div>
            ) : (
              <div>
                <img src={imagePreview} alt="Preview" className="image-preview" style={{ width: '100%' }} />
                <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
                  Image ready for analysis
                </p>
              </div>
            )}
          </div>

          {imagePreview && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <button onClick={handleDetect} disabled={loading} style={{ flex: 1, backgroundColor: '#2ecc71' }}>
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </button>
              <button onClick={() => setImagePreview(null)} className="btn-secondary" style={{ flex: 1 }}>
                Clear
              </button>
            </div>
          )}

          {detection && (
            <div className="card" style={{ border: '2px solid #2ecc71', borderRadius: '8px' }}>
              <div className="card-title">📋 Detection Result</div>

              <div style={{ marginBottom: '1.5rem' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Crop:</span>
                  <span style={{ color: '#3498db', fontWeight: 'bold' }}>{detection.crop}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Disease:</span>
                  <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{detection.disease}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Confidence:</span>
                  <span style={{ color: '#27ae60', fontWeight: 'bold' }}>{detection.confidence}</span>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
                  <strong>💡 Recommendations:</strong>
                  <div style={{ marginTop: '0.5rem', marginLeft: '15px', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#27ae60' }}>🩺 Treatment:</strong><br />
                      {detection.treatment}
                    </p>
                    
                    <p>
                      <strong style={{ color: '#e74c3c' }}>⚠️ Precaution:</strong><br />
                      {detection.precaution}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={handleUploadAnother} style={{ width: '100%' }}>
                📸 Upload Another Image
              </button>
            </div>
          )}

          {!detection && !imagePreview && (
            <div className="card" style={{ backgroundColor: '#f9f9f9', textAlign: 'center' }}>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                💬 <strong>How it works:</strong>
              </p>
              <ol style={{ textAlign: 'left', color: '#666', lineHeight: '1.8' }}>
                <li>Capture or upload a photo of a plant leaf</li>
                <li>Our AI model analyzes the image</li>
                <li>You'll receive a diagnosis with confidence score</li>
                <li>Get recommendations for treatment or prevention</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DiseaseDetection;
