require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Connected");

    const oldListings = await Listing.find({
      "geometry.coordinates": [77.209, 28.6139] // Delhi fallback
    });

    console.log(`📦 Found ${oldListings.length} listings stuck on Delhi`);

    for (let listing of oldListings) {
      try {
        const geoData = await geocodingClient
          .forwardGeocode({
            query: listing.location,
            limit: 1,
          })
          .send();

        if (
          geoData.body.features.length &&
          geoData.body.features[0].geometry
        ) {
          listing.geometry = geoData.body.features[0].geometry;
          await listing.save();
          console.log(`✅ Updated ${listing.title}`);
        } else {
          console.log(`⚠️ No geocode result for ${listing.title}`);
        }
      } catch (err) {
        console.log(`❌ Failed ${listing.title}:`, err.message);
      }
    }

    console.log("🎉 Fix complete!");
    mongoose.connection.close();
  } catch (err) {
    console.error("DB connection error:", err);
  }
})();
