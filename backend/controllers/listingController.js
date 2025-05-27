const Listing = require('../models/Listing');
const { cloudinary } = require('../config/cloudinary');

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const { title, description, price, location, propertyType, bedrooms, bathrooms, squareFeet, amenities, features } = req.body;
    
    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      public_id: file.filename,
      caption: file.originalname
    })) : [];

    const listing = new Listing({
      title,
      description,
      price,
      location: JSON.parse(location),
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      images,
      amenities: JSON.parse(amenities || '[]'),
      features: JSON.parse(features || '[]'),
      createdBy: req.user._id
    });

    await listing.save();
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate('createdBy', 'name email');
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get single listing
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('createdBy', 'name email');
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update listing
exports.updateListing = async (req, res) => {
  try {
    const { title, description, price, location, propertyType, bedrooms, bathrooms, squareFeet, amenities, features } = req.body;
    
    let images = [];
    if (req.files && req.files.length > 0) {
      // Delete old images from cloudinary
      const listing = await Listing.findById(req.params.id);
      if (listing.images && listing.images.length > 0) {
        for (const image of listing.images) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
      
      // Process new images
      images = req.files.map(file => ({
        url: file.path,
        public_id: file.filename,
        caption: file.originalname
      }));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price,
        location: JSON.parse(location),
        propertyType,
        bedrooms,
        bathrooms,
        squareFeet,
        ...(images.length > 0 && { images }),
        amenities: JSON.parse(amenities || '[]'),
        features: JSON.parse(features || '[]')
      },
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: updatedListing });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    // Delete images from cloudinary
    if (listing.images && listing.images.length > 0) {
      for (const image of listing.images) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await listing.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
