const Listing = require('../models/Listing');
const { listingCache } = require('../utils/cache');
const mongoose = require('mongoose');

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
      videos 
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
      createdBy: req.user._id 
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


exports.getAllListings = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      city,
      state,
      propertyType,
      buildingType,
      bedrooms,
      bathrooms,
      minSquareFeet,
      maxSquareFeet,
      furnished,
      airConditioning,
      parking,
      gym,
      swimmingPool,
      internet,
      petFriendly,
      garden,
      security,
      balcony,
      elevator,
      wheelchairAccess,
      sort,
      limit = 10,
      page = 1,
      search
    } = req.query;

   
    const filter = { isAvailable: true };


    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

   
    if (city || state) {
      filter.location = {};
      if (city) filter.location.city = new RegExp(city, 'i');
      if (state) filter.location.state = new RegExp(state, 'i');
    }

    
    if (propertyType) {
      filter.propertyType = propertyType;
    }

  
    if (buildingType) {
      filter.buildingType = buildingType;
    }

    if (bedrooms) {
      filter.bedrooms = Number(bedrooms);
    }

    if (bathrooms) {
      filter.bathrooms = Number(bathrooms);
    }

    if (minSquareFeet || maxSquareFeet) {
      filter.squareFeet = {};
      if (minSquareFeet) filter.squareFeet.$gte = Number(minSquareFeet);
      if (maxSquareFeet) filter.squareFeet.$lte = Number(maxSquareFeet);
    }

    const amenitiesFilter = {};
    if (furnished === 'true') amenitiesFilter['amenities.furnished'] = true;
    if (airConditioning === 'true') amenitiesFilter['amenities.airConditioning'] = true;
    if (parking === 'true') amenitiesFilter['amenities.parking'] = true;
    if (gym === 'true') amenitiesFilter['amenities.gym'] = true;
    if (swimmingPool === 'true') amenitiesFilter['amenities.swimmingPool'] = true;
    if (internet === 'true') amenitiesFilter['amenities.internet'] = true;
    if (petFriendly === 'true') amenitiesFilter['amenities.petFriendly'] = true;
    if (garden === 'true') amenitiesFilter['amenities.garden'] = true;
    if (security === 'true') amenitiesFilter['amenities.security'] = true;
    if (balcony === 'true') amenitiesFilter['amenities.balcony'] = true;
    if (elevator === 'true') amenitiesFilter['amenities.elevator'] = true;
    if (wheelchairAccess === 'true') amenitiesFilter['amenities.wheelchairAccess'] = true;

    Object.assign(filter, amenitiesFilter);


    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') },
        { 'location.state': new RegExp(search, 'i') }
      ];
    }

    
    let sortOption = { createdAt: -1 }; 
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'popular') sortOption = { viewCount: -1 };


    const skip = (Number(page) - 1) * Number(limit);
    
    const listings = await Listing.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email profileImage');

  
    const total = await Listing.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
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


exports.getListingById = async (req, res) => {
  try {
    const listingId = req.params.id;
    console.log('Fetching listing with ID:', listingId);
    
    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      console.log('Invalid listing ID:', listingId);
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID'
      });
    }
    
    const cacheKey = `listing_${listingId}`;
    let listing = null;
    
    try {
      listing = listingCache.get(cacheKey);
      console.log('Cache lookup result:', listing ? 'Found' : 'Not found');
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
      // Continue without cache if there's an error
    }
    
    if (!listing) {
      console.log('Listing not found in cache, fetching from database');
      try {
        listing = await Listing.findById(listingId)
          .populate('createdBy', 'name email profileImage');
        
        if (!listing) {
          console.log('Listing not found in database');
          return res.status(404).json({
            success: false,
            message: 'Listing not found'
          });
        }
        
        // Update view count
        listing.viewCount = (listing.viewCount || 0) + 1;
        await listing.save();
        
        // Cache the listing
        try {
          listingCache.set(cacheKey, listing);
          console.log('Listing cached successfully');
        } catch (cacheError) {
          console.error('Error caching listing:', cacheError);
          // Continue without caching if there's an error
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Error fetching listing from database',
          error: dbError.message
        });
      }
    } else {
      console.log('Listing found in cache');
      // Update view count in background
      try {
        const updatedListing = await Listing.findByIdAndUpdate(
          listingId,
          { $inc: { viewCount: 1 } },
          { new: true }
        );
        
        if (!updatedListing) {
          console.log('Listing no longer exists in database, removing from cache');
          try {
            listingCache.del(cacheKey);
          } catch (cacheError) {
            console.error('Error removing from cache:', cacheError);
          }
          return res.status(404).json({
            success: false,
            message: 'Listing not found'
          });
        }
        
        // Update cache with new view count
        listing.viewCount = updatedListing.viewCount;
        try {
          listingCache.set(cacheKey, listing);
          console.log('View count updated successfully');
        } catch (cacheError) {
          console.error('Error updating cache:', cacheError);
          // Continue without updating cache if there's an error
        }
      } catch (updateError) {
        console.error('Error updating view count:', updateError);
        // Don't fail the request if view count update fails
      }
    }

    // Validate listing data before sending
    if (!listing || !listing._id) {
      console.error('Invalid listing data:', listing);
      return res.status(500).json({
        success: false,
        message: 'Invalid listing data'
      });
    }

    console.log('Sending listing response');
    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error in getListingById:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const updates = req.body;

    // Validate listing ID
    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid listing ID'
      });
    }

    // Find the listing
    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin' && listing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this listing'
      });
    }

    // Handle file uploads if present
    if (req.files) {
      if (req.files.images) {
        const imageFiles = Array.isArray(req.files.images) 
          ? req.files.images 
          : [req.files.images];
        updates.images = imageFiles.map(file => `/uploads/images/${file.filename}`);
      }
      if (req.files.videos) {
        const videoFiles = Array.isArray(req.files.videos) 
          ? req.files.videos 
          : [req.files.videos];
        updates.videos = videoFiles.map(file => `/uploads/videos/${file.filename}`);
      }
    }

    // Update the listing
    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      { $set: updates },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    ).populate('createdBy', 'name email profileImage');

    if (!updatedListing) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update listing'
      });
    }

    // Update cache
    try {
      listingCache.del(`listing_${listingId}`);
    } catch (cacheError) {
      console.error('Error updating cache:', cacheError);
    }

    // Create notification for price change
    if (updates.price && updates.price !== listing.price) {
      try {
        const { createNotification } = require('./notificationController');
        await createNotification({
          recipient: listing.createdBy,
          type: 'price_change',
          title: 'Price Updated',
          message: `The price for your listing "${listing.title}" has been updated to ${updates.price}`,
          relatedListing: listingId,
          actionLink: `/property/${listingId}`
        });
      } catch (err) {
        console.error('Error creating price change notification:', err);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: updatedListing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


exports.deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }
    
    
    if (req.user.role !== 'admin' && listing.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this listing'
      });
    }

    await Listing.findByIdAndDelete(listingId);
    
  
    listingCache.delete(`listing_${listingId}`);

 
    try {
      const Wishlist = require('../models/Wishlist');
      await Wishlist.updateMany(
        { listings: listingId },
        { $pull: { listings: listingId } }
      );
    } catch (err) {
      console.error('Error removing listing from wishlists:', err);
    }

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    console.log('Fetching listings for user:', req.user._id);
    const listings = await Listing.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email profileImage')
      .sort({ createdAt: -1 });
    
    console.log('Found listings:', listings.length);
    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching user listings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.uploadListingMedia = async (req, res) => {
  try {

    
    const files = {
      images: [],
      videos: []
    };
    
 
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) 
        ? req.files.images 
        : [req.files.images];
        
      files.images = imageFiles.map(file => `/uploads/images/${file.filename}`);
    }
    
 
    if (req.files && req.files.videos) {
      const videoFiles = Array.isArray(req.files.videos) 
        ? req.files.videos 
        : [req.files.videos];
        
      files.videos = videoFiles.map(file => `/uploads/videos/${file.filename}`);
    }
    
    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error uploading media:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload',
      error: error.message
    });
  }
};