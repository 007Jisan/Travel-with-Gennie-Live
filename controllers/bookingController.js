const Booking = require('../models/Booking');
const User = require('../models/User');

// ১. ইউজার প্যাকেজ বুক করবে
exports.createBooking = async (req, res) => {
  try {
    const { packageId, agencyId } = req.body;
    const newBooking = new Booking({
      user: req.user.id,
      package: packageId,
      agency: agencyId
    });
    await newBooking.save();

    await newBooking.populate('package', 'title');
    
    const tourist = await User.findById(req.user.id);
    const agency = await User.findById(agencyId);

    const pkgName = newBooking.package?.title || "Tour Package";

    // 🔔 ট্যুরিস্টকে নোটিফিকেশন পাঠানো
    if (tourist) {
      if (!tourist.notifications) tourist.notifications = [];
      tourist.notifications.push({
        message: `Your booking request for "${pkgName}" has been sent to the agency! ⏳`,
        date: new Date()
      });
      tourist.markModified('notifications'); // 🔴 ম্যাজিক ফিক্স: ডাটাবেসকে সেভ করতে বাধ্য করা
      await tourist.save();
    }

    // 🔔 এজেন্সিকে নোটিফিকেশন পাঠানো
    if (agency) {
      if (!agency.notifications) agency.notifications = [];
      agency.notifications.push({
        message: `New booking request from ${tourist?.name || 'a tourist'} for "${pkgName}". 🎒`,
        date: new Date()
      });
      agency.markModified('notifications'); // 🔴 ম্যাজিক ফিক্স
      await agency.save();
    }

    res.status(201).json({ message: '🎉 Booking request sent to the agency successfully!' });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: 'Server Error while booking' });
  }
};

// ২. ইউজারের নিজের বুকিং দেখার জন্য
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('package', 'title price')
      .populate('agency', 'name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ৩. এজেন্সির বুকিং রিকোয়েস্ট দেখার জন্য
exports.getAgencyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ agency: req.user.id })
      .populate('package', 'title')
      .populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// ৪. এজেন্সি বুকিং একসেপ্ট/রিজেক্ট করবে 
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, agency: req.user.id },
      { status },
      { new: true }
    ).populate('package', 'title');

    // 🔔 ট্যুরিস্টকে জানানো হচ্ছে যে বুকিং একসেপ্ট নাকি রিজেক্ট হয়েছে
    if (booking) {
      const user = await User.findById(booking.user);
      if (user) {
        if (!user.notifications) user.notifications = [];
        user.notifications.push({
          message: `Update: Your booking for "${booking.package?.title || 'a package'}" has been ${status}! ${status === 'Approved' ? '✅' : '❌'}`,
          date: new Date()
        });
        user.markModified('notifications'); // 🔴 ম্যাজিক ফিক্স
        await user.save();
      }
    }

    res.json({ message: `Booking ${status}! ✅`, booking });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};