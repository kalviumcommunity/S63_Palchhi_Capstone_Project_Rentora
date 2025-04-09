const Listing = require('../models/Listing');

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
      images
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
      isAvailable: true
    });

    const savedListing = await newListing.save();

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: savedListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
