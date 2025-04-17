import React, { useState, useEffect } from "react";
import { io } from "socket.io-client"; // ✅ Import WebSocket Client
import "./ViewBooking.css"; // ✅ Use separate CSS file
import AdminSidebar from "../../components/AdminSidebar";
import editIcon from "../../assets/pencil.png";
import { Link } from "react-router-dom";
import { auth } from "../../firebase"; // ✅ Import Firebase auth
import { getIdToken } from "firebase/auth"; // ✅ Import function to get token


const socket = io("http://localhost:5000"); // ✅ Connect to WebSocket Server

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);

  // ✅ Fetch Bookings from API
  useEffect(() => {
   
const fetchBookings = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.error("❌ No authenticated user found.");
    return;
  }

  const token = await getIdToken(user); // ✅ Get Firebase auth token

  try {
    const response = await fetch("http://localhost:5000/api/bookings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Send token in headers
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error fetching bookings");
    }

    setBookings(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    setBookings([]);
  }
};


    fetchBookings();

    // ✅ Real-time Updates with WebSockets
    socket.on("bookingUpdated", (updatedBooking) => {
      console.log("🔄 Booking Updated:", updatedBooking);
      setBookings((prevBookings) =>
        prevBookings.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
      );
    });

    socket.on("newBooking", (newBooking) => {
      console.log("🆕 New Booking Created:", newBooking);
      setBookings((prevBookings) => [newBooking, ...prevBookings]); // ✅ Add New Booking to List
    });

    socket.on("bookingDeleted", (deletedBookingId) => {
      console.log("❌ Booking Deleted:", deletedBookingId);
      setBookings((prevBookings) => prevBookings.filter((b) => b._id !== deletedBookingId));
    });

    return () => {
      socket.off("bookingUpdated");
      socket.off("newBooking");
      socket.off("bookingDeleted");
    };
  }, []);

  return (
    <div className="view-bookings-layout">
      <AdminSidebar />
      <div className="view-content-area">
        <div className="view-bookings-container">
          <h4>Bookings List</h4>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table className="view-bookings-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User</th>
                  <th>Purpose</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Attendees</th>
                  <th>Hall Type</th>
                  <th>Allocated Hall</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking._id}>
                    <td>{index + 1}</td>
                    <td>{booking.userEmail}</td>
                    <td>{booking.purpose}</td>
                    <td>
                      {new Date(booking.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td>{booking.attendees}</td>
                    <td>{booking.hallType || "N/A"}</td>
                    <td>{booking.status === "Approved" ? booking.selectedHall : "—"}</td>
                    <td>
                      <span
                        className={`status ${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin-edit-booking/${booking._id}`}>
                        <img src={editIcon} alt="Edit" className="view-icon" />
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

export default ViewBookings;
