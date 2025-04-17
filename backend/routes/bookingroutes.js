const express = require("express");
const multer = require("multer");
const Booking = require("../models/Booking");
const Hall = require("../models/Halls");
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');


module.exports = (io) => {
  const router = express.Router();

  // ✅ Configure multer for file uploads
  const upload = multer({ dest: "uploads/" });

  // ✅ Fetch Available Halls (Fixed Allocation Issue)
  router.get("/available-halls", async (req, res) => {
    try {
      const { date, startTime, endTime, hallType } = req.query;
      console.log("🔍 Checking halls for:", { date, startTime, endTime, hallType });
  
      const halls = await Hall.find({ hallType });
      console.log("📌 Found halls:", halls.map(h => h.name));
  
      const conflictingBookings = await Booking.find({
        date,
        status: "Approved",
        allocatedHall: { $ne: null },
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
          { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
        ],
      });
      const allocatedHalls = conflictingBookings
      .map(booking => booking.allocatedHall)
      .filter(hall => hall && hall.toLowerCase() !== "conference" && hall.toLowerCase() !== "discussion");
    

      console.log("❌ Already Allocated Halls:", allocatedHalls);
  
      let availableHalls = halls
        .map(hall => hall.name)
        .filter(hallName => !allocatedHalls.includes(hallName));
  
      console.log("✅ Final Available Halls (Filtered):", availableHalls);
  
      if (availableHalls.length === 0) {
        return res.json({ availableHalls: ["No Hall Available"] });
      }
  
      res.json({ availableHalls });
    } catch (error) {
      console.error("❌ Error fetching available halls:", error);
      res.status(500).json({ error: "Server error while fetching available halls." });
    }
  });
  
  
  
  

 // ✅ Get All Bookings (Chronological Order for Admin)
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, startTime: 1 });

    // ✅ Ensure allocatedHall is included in the response
    const formattedBookings = bookings.map((booking) => ({
      ...booking._doc,
      allocatedHall: booking.allocatedHall || booking.selectedHall, // If allocatedHall is not set, fallback to selectedHall
    }));

    res.json(formattedBookings);
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching bookings" });
  }
});


  // ✅ Get User-Specific Bookings
  router.get("/user/:email", async (req, res) => {
    try {
      const bookings = await Booking.find({ userEmail: req.params.email });
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching user bookings" });
    }
  });

  // ✅ Get a Single Booking by ID
  router.get("/:id", async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Server error while fetching booking" });
    }
  });

  // ✅ User Updates Their Own Booking (No Hall Allocation)
  router.put("/user/:id", async (req, res) => {
    try {
      const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedBooking) return res.status(404).json({ error: "Booking not found" });
      res.json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
      res.status(500).json({ error: "Error updating booking" });
    }
  });

  // ✅ Admin Updates Booking (Hall Allocation + Status Change)
  router.put("/admin/:id", async (req, res) => {
    try {
      const { selectedHall, status, hallType, date, startTime, endTime, allocatedHall } = req.body;

if (!selectedHall || !status || !hallType) {
  return res.status(400).json({ error: "All fields (selectedHall, status, hallType) are required." });
}

// ✅ Use allocatedHall for final hall assignment
const hallToCheck = allocatedHall || selectedHall;

const existingBooking = await Booking.findOne({
  date,
  allocatedHall: hallToCheck, // ✅ Ensure we're checking allocated halls
  $or: [
    { startTime: { $lt: endTime, $gte: startTime } }, 
    { endTime: { $gt: startTime, $lte: endTime } }, 
    { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
  ],
});


if (existingBooking) {
  return res.status(400).json({ error: "Selected hall is already booked for this time slot." });
}

const updatedBooking = await Booking.findByIdAndUpdate(
  req.params.id,
  { selectedHall, status, hallType, allocatedHall: selectedHall }, // ✅ Ensure correct hall is stored
  { new: true }
);



      if (!updatedBooking) return res.status(404).json({ error: "Booking not found" });

      console.log("✅ Booking Updated Successfully:", updatedBooking);
      // 🔔 In-App Notification for Admin Update
await Notification.create({
  userId: updatedBooking.userEmail,
  message: `Your booking on ${updatedBooking.date} has been ${updatedBooking.status} by the admin.`,
});

// 📧 Email Notification
await sendEmail(
  updatedBooking.userEmail,
  "Booking Status Updated",
  `Your booking on ${updatedBooking.date} has been ${updatedBooking.status}. Allocated Hall: ${updatedBooking.allocatedHall}`
);

// 🔴 Real-time Notification
io.emit("notification", `📢 Booking updated for ${updatedBooking.userEmail}`);


      // ✅ Emit WebSocket Event to Notify Admins
      io.emit("bookingUpdated", updatedBooking);

      res.json({ message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
      res.status(500).json({ error: "Server error while updating booking" });
    }
  });

  // ✅ Create a New Booking
// ✅ Create a New Booking
router.post("/", upload.single("proof"), async (req, res) => {
  try {
    const { purpose, date, startTime, endTime, attendees, userEmail, bookingType, selectedHall, hallType } = req.body;

    if (!purpose || !date || !startTime || !endTime || !attendees || !userEmail || !bookingType || !selectedHall) {
      return res.status(400).json({ error: "All fields are required, including hallType." });
    }

    let hallTypeToSave = hallType;
    if (!hallTypeToSave && bookingType === "hall") {
      hallTypeToSave = selectedHall.includes("Conference") ? "conference" : "discussion";
    }

    let allocatedHall = selectedHall; 

    // ✅ Fix: Ensure allocatedHall is set to an actual hall name
if (allocatedHall.toLowerCase() === "conference") {
  allocatedHall = selectedHall; // ✅ Store actual hall name
}

    

    // ✅ If user selected "Any", find an available hall dynamically
    if (selectedHall.toLowerCase() === "any") {
      const availableHalls = await Hall.find({ hallType: hallTypeToSave });

      const filteredHalls = availableHalls.filter((hall) => {
        return !hall.bookings.some(
          (booking) =>
            booking.date === date &&
            ((startTime >= booking.startTime && startTime < booking.endTime) ||
              (endTime > booking.startTime && endTime <= booking.endTime) ||
              (startTime <= booking.startTime && endTime >= booking.endTime))
        );
      });

      allocatedHall = filteredHalls.length > 0 ? filteredHalls[0].name : "No Hall Available";
    }

    // ✅ Include allocatedHall when saving the booking
    const newBooking = new Booking({
      purpose,
      date,
      startTime,
      endTime,
      attendees,
      userEmail,
      proof: req.file ? req.file.filename : null,
      status: "Pending",
      bookingType,
      selectedHall,
      hallType: hallTypeToSave,
      allocatedHall, // ✅ Store actual allocated hall name
    });

    await newBooking.save();
    // 🔔 In-App Notification for User Booking
await Notification.create({
  userId: newBooking.userEmail,  // using email as identifier
  message: `Your booking for ${newBooking.date} at ${newBooking.startTime} has been submitted.`,
});

// 📧 Email Notification
await sendEmail(
  newBooking.userEmail,
  "Booking Submitted",
  `Hi, your booking has been submitted successfully. Details:\nHall: ${newBooking.allocatedHall}\nDate: ${newBooking.date}\nTime: ${newBooking.startTime} - ${newBooking.endTime}`
);

// 🔴 Real-time Notification
io.emit("notification", `📢 New booking submitted by ${newBooking.userEmail}`);


    // ✅ Notify Admins About New Booking
    io.emit("newBooking", newBooking);

    res.status(201).json({ message: "Booking created successfully", booking: newBooking });

  } catch (error) {
    res.status(500).json({ error: "Server error while creating booking" });
  }
});


  // ✅ Delete Booking by ID
  router.delete("/:id", async (req, res) => {
    try {
      const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
      if (!deletedBooking) return res.status(404).json({ error: "Booking not found" });

      // ✅ Notify Admins About Booking Deletion
      io.emit("bookingDeleted", req.params.id);

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting booking" });
    }
  });

  return router;
};
