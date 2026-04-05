const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const router = express.Router();

// Cache for crop data
let cropsData = [];

// Initialize crops data from CSV on startup
const initializeCropsData = () => {
  const csvPath = path.join(__dirname, '../data/crops.csv');

  if (!fs.existsSync(csvPath)) {
    console.warn('Crops CSV file not found at:', csvPath);
    return;
  }

  cropsData = [];
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      cropsData.push(row);
    })
    .on('end', () => {
      console.log('Crops data loaded successfully');
    });
};

// Get all crops
router.get('/', (req, res) => {
  try {
    const { search, soilType } = req.query;
    let filtered = cropsData;

    if (search) {
      filtered = filtered.filter((crop) =>
        crop.crop_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (soilType) {
      filtered = filtered.filter((crop) =>
        crop.soil_type.toLowerCase().includes(soilType.toLowerCase())
      );
    }

    res.json({
      total: filtered.length,
      crops: filtered,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single crop
router.get('/:cropId', (req, res) => {
  try {
    const crop = cropsData.find((c) => c.crop_name.toLowerCase() === req.params.cropId.toLowerCase());
    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.json(crop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = { router, initializeCropsData };
