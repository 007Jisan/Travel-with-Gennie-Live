const Package = require('../models/Package');

// ১. Create Package
exports.createPackage = async (req, res) => {
  try {
    const { title, price, hotelPricing, description } = req.body;
    const newPackage = new Package({ agencyId: req.user.id, title, price, hotelPricing, description });
    await newPackage.save();
    res.status(201).json({ message: 'Package created successfully! 🎉', package: newPackage });
  } catch (error) {
    res.status(500).json({ message: 'Server Error while creating package' });
  }
};

// ২. Get Agency Packages
exports.getAgencyPackages = async (req, res) => {
  try {
    const packages = await Package.find({ agencyId: req.user.id }).sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error while fetching packages' });
  }
};

// ৩. Get All Packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 }).populate('agencyId', 'name'); 
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error while fetching all packages' });
  }
};

// 🟢 ৪. Update Package (এডিট করা)
exports.updatePackage = async (req, res) => {
  try {
    const updatedPkg = await Package.findOneAndUpdate(
      { _id: req.params.id, agencyId: req.user.id },
      req.body,
      { new: true }
    );
    res.json({ message: 'Package updated successfully! ✅', package: updatedPkg });
  } catch (error) {
    res.status(500).json({ message: 'Server Error while updating' });
  }
};

// 🟢 ৫. Delete Package (ম্যানেজ/রিমুভ করা)
exports.deletePackage = async (req, res) => {
  try {
    await Package.findOneAndDelete({ _id: req.params.id, agencyId: req.user.id });
    res.json({ message: 'Package deleted successfully! 🗑️' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error while deleting' });
  }
};