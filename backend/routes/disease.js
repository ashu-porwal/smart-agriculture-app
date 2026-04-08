const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticate = require('../middleware/authenticate');
const axios = require("axios");
const FormData = require("form-data");


const router = express.Router();

// Configure multer for image uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Simulate disease detection (in production, use a real ML model or API)
/*const detectDisease = (imagePath) => {
  // Mock disease detection results
  const mockDiseases = [
    {
      disease: 'Leaf Blight',
      confidence: 0.92,
      recommendation: 'Apply appropriate fungicide and remove infected leaves. Ensure good air circulation.',
    },
    {
      disease: 'Powdery Mildew',
      confidence: 0.87,
      recommendation: 'Treat with sulfur-based fungicide. Reduce humid conditions.',
    },
    {
      disease: 'Early Blight',
      confidence: 0.89,
      recommendation: 'Remove infected leaves and apply copper fungicide. Practice crop rotation.',
    },
    {
      disease: 'Healthy',
      confidence: 0.95,
      recommendation: 'Plant looks healthy! Continue regular maintenance and monitoring.',
    },
  ];

  return mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
};*/

// Upload and detect disease
// router.post('/detect', authenticate, upload.single('image'), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'No image provided' });
//     }

//     const imagePath = req.file.path;
//     const detection = detectDisease(imagePath);

//     res.json({
//       message: 'Disease detection successful',
//       image: {
//         filename: req.file.filename,
//         path: `/api/disease/${req.file.filename}`,
//       },
//       detection: {
//         disease: detection.disease,
//         confidence: (detection.confidence * 100).toFixed(2) + '%',
//         recommendation: detection.recommendation,
//       },
//     });
//   } catch (error) {
//     if (req.file) {
//       fs.unlink(req.file.path, (err) => {
//         if (err) console.error('Error deleting file:', err);
//       });
//     }
//     res.status(500).json({ message: 'Error detecting disease', error: error.message });
//   }
// });

router.post('/detect', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));

    // 🔥 CALL YOUR ML MODEL
    const response = await axios.post(
      process.env.ML_API_URL + '/predict',
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    const data = response.data;

    res.json({
      message: 'Disease detection successful',
      image: {
        filename: req.file.filename,
        path: `/api/disease/${req.file.filename}`,
      },
      detection: {
        crop: data.crop,
        disease: data.disease,
        confidence: data.confidence + '%',
        treatment: data.treatment,
        precaution: data.precaution,
      },
    });

  } catch (error) {
    console.error(error);

    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

   console.error("FULL ERROR:", error.response?.data || error.message);

  res.status(500).json({
    message: 'Server error',
    error: error.response?.data || error.message,
  });
  }
});

// Serve uploaded images
router.get('/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving image', error: error.message });
  }
});

module.exports = router;
