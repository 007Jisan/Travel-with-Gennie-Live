const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { OpenAI } = require('openai');
const path = require('path'); 

const Spot = require('./models/Spot'); 
const User = require('./models/User');

dotenv.config();
const app = express();

app.use(cors());

// 🔴 ছবি আপলোডের জন্য সাইজ লিমিট ১০ এমবি করে দেওয়া হলো
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/images', express.static(path.join(__dirname, 'public/images')));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const packageRoutes = require('./routes/packageRoutes');
app.use('/api/packages', packageRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1", 
  apiKey: process.env.OPENAI_API_KEY, 
});

app.post('/api/chat', async (req, res) => {
  const { message, language = 'en' } = req.body;
  try {
    const targetLanguage = language === 'bn' ? 'Bengali' : 'English';
    const completion = await openai.chat.completions.create({
      model: "nvidia/nemotron-3-super-120b-a12b:free", 
      messages: [
        { 
          role: "system", 
          content: `You are a helpful travel assistant named 'Genie' for 'Explore with Genie'. 
          Reply ONLY in ${targetLanguage}. Keep your answers very short and friendly.`
        },
        { role: "user", content: message }
      ],
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    res.json({ reply: language === 'bn' ? "জিনি ব্যস্ত ভাই।" : "I'm busy, sorry!" });
  }
});

app.get('/api/spots', async (req, res) => {
    try {
      const spots = await Spot.find();
      res.json(spots);
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
});

// 🟢 Bulletproof Review & Points Logic
app.post('/api/spots/:id/reviews', async (req, res) => {
    try {
      const spot = await Spot.findById(req.params.id);
      if (!spot) return res.status(404).json({ message: "Spot not found" });
      
      const newReview = { 
        userName: req.body.userName || "Genie Tourist", 
        rating: Number(req.body.rating), 
        comment: req.body.comment 
      };
      spot.reviews.push(newReview);
      await spot.save(); 

      let user = null;
      if (req.body.userId && req.body.userId !== "undefined" && req.body.userId !== "null") {
        if (mongoose.Types.ObjectId.isValid(req.body.userId)) {
           user = await User.findById(req.body.userId);
        }
      }

      if (!user && req.body.userName && req.body.userName !== "Verified Tourist") {
        user = await User.findOne({ name: req.body.userName });
      }

      if (user) {
        user.points = (user.points || 0) + 10;
        await user.save();
      }

      res.status(201).json({ message: "Review added and points awarded! 🎉", spot });
    } catch (error) {
      console.error("Review Error:", error);
      res.status(500).json({ message: "Server Error" });
    }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
      const users = await User.find({ points: { $gt: 0 } }).sort({ points: -1 }).limit(10).select('name points');
      res.json(users);
  } catch(err) { 
      res.status(500).json({message: "Error fetching leaderboard"}); 
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.json(users);
  } catch(err) { 
      res.status(500).json({message: "Error fetching users"}); 
  }
});

app.delete('/api/admin/spots/:spotId/reviews/:reviewId', async (req, res) => {
  try {
      const spot = await Spot.findById(req.params.spotId);
      spot.reviews = spot.reviews.filter(r => r._id.toString() !== req.params.reviewId);
      await spot.save();
      res.json({message: "Review deleted successfully 🗑️"});
  } catch(err) { 
      res.status(500).json({message: "Error deleting review"}); 
  }
});

app.post('/api/users/:id/preferences', async (req, res) => {
  try {
    const { budgetPreference, tripDurationPreference, searchItem } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (budgetPreference) user.budgetPreference = budgetPreference;
    if (tripDurationPreference) user.tripDurationPreference = tripDurationPreference;
    if (searchItem && !user.searchHistory.includes(searchItem)) {
        user.searchHistory.push(searchItem);
        if(user.searchHistory.length > 5) user.searchHistory.shift(); 
    }
    await user.save();
    res.json({ message: "Preferences saved!", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.get('/api/users/:id/recommendations', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const spots = await Spot.find();

    let recommendedSpots = spots.filter(spot => {
      let matchScore = 0;
      if (user.budgetPreference === 'Low' && spot.estimatedBudget.includes('500')) matchScore += 2;
      if (user.budgetPreference === 'High' && spot.estimatedBudget.includes('5000')) matchScore += 2;
      user.searchHistory.forEach(history => {
        if (spot.name.toLowerCase().includes(history.toLowerCase()) || spot.location.toLowerCase().includes(history.toLowerCase())) {
          matchScore += 3; 
        }
      });
      return matchScore > 0;
    });

    if (recommendedSpots.length === 0) recommendedSpots = spots.slice(0, 2);
    res.json(recommendedSpots);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated successfully! 🎉", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error while updating profile" });
  }
});

app.get('/api/users/:id/notifications', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user && user.notifications ? user.notifications.reverse() : []);
  } catch (error) { res.status(500).json([]); }
});

app.delete('/api/users/:id/notifications', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { notifications: [] });
    res.json({ message: "Cleared" });
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

app.get('/api/seed-spots', async (req, res) => {
  try {
    await Spot.deleteMany({}); 
    const local = "/images/";
    const premiumSpots = [
      { name: 'Lalbagh Fort', nameBN: 'লালবাগ কেল্লা', mainImage: 'https://images.pexels.com/photos/34957286/pexels-photo-34957286.jpeg', sliderImages: ['https://images.pexels.com/photos/34957286/pexels-photo-34957286.jpeg'], location: 'Old Dhaka', locationBN: 'পুরান ঢাকা', lat: 23.7198, lng: 90.3883, description: 'Lalbagh Fort is an incomplete 17th-century Mughal fort complex.', descriptionBN: '১৭শ শতকের মোগল আমলের একটি অসম্পূর্ণ দুর্গ।', bestVisitingTime: 'November to March', estimatedBudget: '500 BDT', nearbyHotels: 'Hotel 71', safetyTips: 'Beware of pickpockets.' },
      { name: "Cox's Bazar", nameBN: 'কক্সবাজার', mainImage: `${local}coxsbazar.jpg`, sliderImages: [`${local}coxsbazar.jpg`], location: 'Chittagong Division', locationBN: 'চট্টগ্রাম বিভাগ', lat: 21.4272, lng: 92.0058, description: 'The longest natural unbroken sea beach in the world.', descriptionBN: 'বিশ্বের দীর্ঘতম প্রাকৃতিক সমুদ্র সৈকত।', bestVisitingTime: 'Oct-Mar', estimatedBudget: '5000 BDT', nearbyHotels: 'Sayeman Resort', safetyTips: 'Do not swim far during high tide.' },
      { name: 'Jaflong', nameBN: 'জাফলং', mainImage: `${local}jaflong.jpg`, sliderImages: [`${local}jaflong.jpg`], location: 'Sylhet', locationBN: 'সিলেট', lat: 25.1634, lng: 92.0151, description: 'Renowned for its stone collections and clear river water.', descriptionBN: 'পাথর সংগ্রহ এবং স্বচ্ছ নদীর পানির জন্য পরিচিত।', bestVisitingTime: 'Autumn', estimatedBudget: '4000 BDT', nearbyHotels: 'Jaflong Inn', safetyTips: 'Do not cross the border.' }
    ];
    await Spot.insertMany(premiumSpots);
    res.send("✅ Success!");
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

// 🟢 ফ্রন্টএন্ড এবং ব্যাকএন্ড একসাথে যুক্ত করার ম্যাজিক কোড!
app.use(express.static(path.join(__dirname, 'build')));

// 🔴 ম্যাজিক ফিক্স: Express 5 এর জন্য '*' এর বদলে /.*/ ব্যবহার করা হলো
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
// 🟢 ম্যাজিক শেষ

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB Connected ✅'))
  .catch(err => console.error('Database connection failed ❌:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));