const Listing = require('../models/Listing');

// Create a new listing
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      images,
      createdBy
    } = req.body;

    const newListing = new Listing({
      title,
      description,
      price,
      location,
      propertyType,
      bedrooms,
      bathrooms,
      squareFeet,
      images,
      isAvailable: true,
      createdBy : req.user._id // ensure this is provided
    });

    const savedListing = await newListing.save();

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: savedListing
    });
  } catch (error) {
    console.error('Error creating listing:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate('createdBy', 'name email');
    res.status(200).json({
      success: true,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('createdBy', 'name email');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error fetching listing by ID:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update a listing
exports.updateListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const updates = req.body;

    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedListing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
