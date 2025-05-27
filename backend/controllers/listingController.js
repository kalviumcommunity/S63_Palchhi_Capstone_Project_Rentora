const Listing = require('../models/Listing');
const { listingCache } = require('../utils/cache');

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
    const cacheKey = `listing_${listingId}`;
    
  
    let listing = listingCache.get(cacheKey);
    
    if (!listing) {

      listing = await Listing.findByIdAndUpdate(
        listingId,
        { $inc: { viewCount: 1 } },
        { new: true }
      ).populate('createdBy', 'name email profileImage');
      
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }
      
     
      listingCache.set(cacheKey, listing);
    } else {
   
      Listing.findByIdAndUpdate(
        listingId,
        { $inc: { viewCount: 1 } }
      ).exec().catch(err => console.error('Error updating view count:', err));
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

exports.updateListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const updates = req.body;

    
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
        message: 'Not authorized to update this listing'
      });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      updates,
      { new: true, runValidators: true }
    );


    listingCache.delete(`listing_${listingId}`);


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
    const listings = await Listing.find({ createdBy: req.user._id });
    
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