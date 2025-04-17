import React, { useState, useEffect } from 'react';
import './MyBookings.css';
import Sidebar from '../../components/Sidebar';
import viewIcon from '../../assets/view.png';
import editIcon from '../../assets/pencil.png';
import { Link, useLocation } from "react-router-dom";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const location = useLocation();
  const storedUser = sessionStorage.getItem("user");
  const user = location.state?.user || (storedUser ? JSON.parse(storedUser) : null);
  

  console.log("User in MyBookings:", user); // Debugging log to check user data

  useEffect(() => {
    const fetchBookings = async () => {
      const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
  
      if (!storedUser.email) {
        console.warn("❌ User email not found, skipping fetch");
        return;
      }
  
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/user/${storedUser.email}`);
        const data = await response.json();
  
        console.log("✅ Bookings API Response:", data);
  
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
        setBookings([]);
      }
    };
  
    fetchBookings();
  }, []);
  
  

  return (
    <div className="my-bookings-layout">
      <Sidebar />
      <div className="content-area">
        <div className="my-bookings-container">
          <h4>My Bookings</h4>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table className="bookings-table">
    <thead>
  <tr>
    <th>S.No</th>
    <th>Purpose</th>
    <th>Date</th>
    <th>Status</th>
    <th>Allocated Hall</th>  {/* ✅ New Column */}
    <th>View</th>
    <th>Edit</th>
  </tr>
</thead>
<tbody>
  {bookings.map((booking, index) => (
    <tr key={booking._id}>
      <td>{index + 1}</td>
      <td>{booking.purpose}</td>
      <td>{new Date(booking.date).toLocaleDateString("en-GB")}</td>
      <td>{booking.status}</td>
      <td>
        {booking.status === "Approved" ? booking.selectedHall : booking.status} {/* ✅ Show correct status */}
      </td>
      <td>
        <button className="icon-btn">
          <img src={viewIcon} alt="View" className="icon" />
        </button>
      </td>
      <td>
        <Link to={`/edit-booking/${booking._id}`}>
          <img src={editIcon} alt="Edit" className="icon" />
        </Link>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
