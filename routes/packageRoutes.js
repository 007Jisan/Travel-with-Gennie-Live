const express = require('express');
const router = express.Router();
const { createPackage, getAgencyPackages, getAllPackages, updatePackage, deletePackage } = require('../controllers/packageController'); 
const protect = require('../middleware/authMiddleware');

// এজেন্সির রাউট 
router.post('/create', protect, createPackage);
router.get('/my-packages', protect, getAgencyPackages);
router.put('/update/:id', protect, updatePackage);    // 🟢 Update 
router.delete('/delete/:id', protect, deletePackage); // 🟢 Delete

// ট্যুরিস্টদের রাউট
router.get('/all', getAllPackages);

module.exports = router;