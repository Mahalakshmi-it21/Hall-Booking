import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css"; // ✅ Use existing Sidebar styles
import logo from "../assets/image.png"; // ✅ Correct import

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="sidebar-logo" />
        <span className="logo-text"><h3>BIT</h3></span>
      </div>
      <ul>
        <li onClick={() => navigate("/admin")}>Dashboard</li>
        <li onClick={() => navigate("/admin/view-bookings")}>View Bookings</li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
