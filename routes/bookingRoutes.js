const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getAgencyBookings, updateBookingStatus } = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');

router.post('/create', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/agency-bookings', protect, getAgencyBookings);
router.put('/update-status/:id', protect, updateBookingStatus);

module.exports = router;