const mongoose = require("mongoose");

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // Hall name (e.g., Conference Hall 1)
  type: { type: String, enum: ["conference", "discussion"], required: true },  // Type of hall
  location: { type: String, required: true },  // Floor location
  capacity: { type: Number, required: true },  // Capacity of the hall
  bookings: [
    {
      date: { type: String, required: true },  // Date of booking
      startTime: { type: String, required: true },  // Start time
      endTime: { type: String, required: true }  // End time
    }
  ]
});

const Hall = mongoose.model("Hall", hallSchema);

module.exports = Hall;
