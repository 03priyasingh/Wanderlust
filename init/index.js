const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main().then(() => {
//   console.log('Connected to DB');                                          
// }).catch(err => {
//   console.error(err);
// });

// async function main() {
//     await mongoose.connect(MONGO_URL);
// };

const initDB = async() => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj, geometry: {type: "Point", coordinates: [77.209, 28.6139]}}));
  await Listing.insertMany(initData.data);
  console.log("data was initialised");
};

initDB();