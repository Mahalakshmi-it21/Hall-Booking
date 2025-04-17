require('dotenv').config(); // ✅ Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http'); // ✅ Import HTTP module
const { Server } = require('socket.io'); // ✅ Import Socket.io
const cookieParser = require('cookie-parser'); // ✅ Import Cookie Parser for JWT authentication
const bookingRoutes = require('./routes/bookingroutes.js'); // ✅ Booking routes
const authMiddleware = require('./middlewares/authMiddleware'); // ✅ Keep if needed
const multer = require('multer');
const notificationRoutes = require('./routes/notificationRoutes');


const app = express();
app.use('/api/notifications', notificationRoutes);
const server = http.createServer(app); // ✅ Create HTTP Server
const io = new Server(server, { cors: { origin: "http://localhost:3000", credentials: true } }); // ✅ Enable WebSocket support

// ✅ Load MongoDB URI from .env
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI is missing in .env file");
  process.exit(1); // 🔴 Stop the server if MONGO_URI is not set
}

// ✅ Middleware
app.use(cors({
  origin: "http://localhost:3000", // ✅ Allow frontend requests
  credentials: true // ✅ Allow cookies in requests
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ Enable parsing of cookies

// ✅ Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// ✅ Static folder for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1); // 🔴 Stop the server if MongoDB connection fails
  });

// ✅ WebSocket Setup
io.on("connection", (socket) => {
  console.log("🔌 Admin connected:", socket.id);

  // ✅ Handle Admin Disconnect
  socket.on("disconnect", () => {
    console.log("❌ Admin disconnected:", socket.id);
  });
});

// ✅ Pass `io` to `bookingRoutes.js`
app.use('/api/bookings', bookingRoutes(io));

// ✅ Test Protected Route (Only if you need authentication for some routes)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

// ✅ Start server with WebSocket support
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
