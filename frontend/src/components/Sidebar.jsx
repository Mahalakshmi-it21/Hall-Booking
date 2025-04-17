import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logo from "../assets/image.png";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <span className="logo-text"><h3>BIT</h3></span>
      </div>
      <ul>
        <li onClick={() => navigate("/user")}>Dashboard</li>
        <li onClick={() => navigate("/book-hall")}>Book a Hall</li>        
        <li onClick={() => navigate("/my-bookings")}>My Bookings</li>
      </ul>
    </div>
  );
};

export default Sidebar;
