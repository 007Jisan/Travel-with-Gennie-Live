const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ==========================================
// ১. সাইনআপ লজিক
// ==========================================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user (যদি role সিলেক্ট না করে, ডিফল্ট tourist হবে)
    user = new User({ name, email, password, role: role || 'tourist' });
    await user.save();

    res.status(201).json({ message: 'User registered successfully ✅' });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: 'Server Error: Check if all fields are correct' });
  }
};

// ==========================================
// ২. লগইন লজিক (🔥 পেলোড ফিক্স করা হয়েছে)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 🔥 পেলোড স্ট্রাকচার মিডলওয়্যারের সাথে মেলানো হলো
    const payload = { user: { id: user._id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1d' });
    
    // 🔥 ফ্রন্টএন্ডের Navbar যেন সহজেই role পেতে পারে তাই role আলাদা পাঠানো হলো
    res.json({ 
      token, 
      role: user.role, 
      userId: user._id,
      user: { id: user._id, name: user.name, role: user.role } 
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: 'Server Error during Login' });
  }
};

// ==========================================
// ৩. প্রোফাইল দেখার লজিক (GET)
// ==========================================
exports.getProfile = async (req, res) => {
  try {
    // পাসওয়ার্ড বাদে ইউজারের বাকি সব ডাটা ডাটাবেস থেকে আনবে
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error("Profile Fetch Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ==========================================
// ৪. প্রোফাইল আপডেট/এডিট করার লজিক (PUT)
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, phone, address, bio } = req.body;
    
    // ডাটাবেসে ইউজারের ডাটা আপডেট করবে
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, age, phone, address, bio } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile Update Error:", err.message);
    res.status(500).json({ message: 'Server Error during update' });
  }
};