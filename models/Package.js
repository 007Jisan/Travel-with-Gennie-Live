const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  
  // 🟢 নতুন: হোটেল প্রাইসিং যুক্ত করা হলো
  hotelPricing: { type: String, default: "Standard: 1500 BDT/night, Premium: 4000 BDT/night" }, 
  
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);