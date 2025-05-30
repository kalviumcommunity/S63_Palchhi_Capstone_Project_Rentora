const mongoose = require('mongoose');
const Listing = require('../models/Listing');
require('dotenv').config();

const migrateListingStatus = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Update all listings
    const result = await Listing.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'available' } }
    );

    console.log(`Updated ${result.modifiedCount} listings`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateListingStatus(); 