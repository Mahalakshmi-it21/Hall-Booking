const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../serviceAccountKey.json")), // 🔥 Ensure this file exists!
  });
}

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // ✅ Store user data in the request object
    next(); // ✅ Proceed to the next middleware
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
  }
};

module.exports = authMiddleware;
