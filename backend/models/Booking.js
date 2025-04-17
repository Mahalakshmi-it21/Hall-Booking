const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  purpose: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  attendees: { type: Number, required: true, min: 1 },
  userEmail: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Cancelled"], default: "Pending" },
  proof: { type: String },

  // ✅ Fixed Issues
  bookingType: { type: String, required: true, enum: ["hall", "floor"] },
  hallType: { type: String, enum: ["conference", "discussion"], default: "" }, // ✅ Changed from null to empty string
  selectedHall: { type: String, required: true },
  allocatedHall: { type: String, default: "" }, // ✅ Ensure default empty string
});

module.exports = mongoose.model("Booking", bookingSchema);
