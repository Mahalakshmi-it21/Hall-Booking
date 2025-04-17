import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { googleSignIn, adminSignIn } from "../components/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    const userData = await googleSignIn();
    console.log("✅ Google Sign-In User Data:", userData);

    if (userData) {
      sessionStorage.setItem("user", JSON.stringify(userData)); // ✅ Store in sessionStorage
      navigate("/user", { state: { user: userData } });
    }
  };

  // ✅ Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    toast.dismiss();

    const adminData = await adminSignIn(email, password);
    if (adminData) {
      sessionStorage.setItem("admin", JSON.stringify(adminData)); // ✅ Store in sessionStorage
      navigate("/admin");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={require("../assets/image.png")} alt="Logo" className="login-logo" />
        <h2>Welcome Back!</h2>
        <div className="portal-title">Bannari Amman Institute of Technology</div>

        <ToastContainer position="top-right" autoClose={3000} />

        <form onSubmit={handleAdminLogin}>
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input password-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button className="login-btn">Login</button>
        </form>

        <div className="separator">
          <div className="line"></div>
          <span>or</span>
          <div className="line"></div>
        </div>

        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>

        <p className="login-note">Stay ahead with our Library Hall Booking System!</p>
      </div>
    </div>
  );
}

export default LoginPage;
