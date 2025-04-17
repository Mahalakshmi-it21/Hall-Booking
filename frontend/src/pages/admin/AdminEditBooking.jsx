import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminEditBooking.css";
import { auth } from "../../firebase";
import { getIdToken } from "firebase/auth";
// eslint-disable-next-line no-unused-vars
import socket from "../../socket";

const AdminEditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [availableHalls, setAvailableHalls] = useState([]);
  const [formData, setFormData] = useState({
    selectedHall: "",
    status: "Pending",
  });

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        console.log("🔍 Fetching booking details...");
        const response = await fetch(`http://localhost:5000/api/bookings/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Error fetching booking");

        console.log("✅ Booking Data Fetched:", data);

        let hallTypeValue = data.hallType;
        if (!hallTypeValue && data.selectedHall) {
          hallTypeValue = data.selectedHall.includes("Conference") ? "conference" : "discussion";
        }

        setBooking(data);
        setFormData({
          selectedHall: data.selectedHall || "",
          status: data.status || "Pending",
          hallType: hallTypeValue,
        });

        if (data.date && data.startTime && data.endTime && hallTypeValue) {
          fetchAvailableHalls(data.date, data.startTime, data.endTime, hallTypeValue, data.selectedHall);
        }
      } catch (error) {
        console.error("❌ Error fetching booking:", error);
        toast.error("Failed to fetch booking details.");
      }
    };
    fetchBooking();
  }, [id]);

  const fetchAvailableHalls = async (date, startTime, endTime, hallType, currentHall) => {
    if (!date || !startTime || !endTime || !hallType) return;

    try {
      console.log("🔍 Fetching available halls for:", { date, startTime, endTime, hallType });
      const response = await fetch(
        `http://localhost:5000/api/bookings/available-halls?date=${date}&startTime=${startTime}&endTime=${endTime}&hallType=${hallType}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error fetching halls");

      let updatedAvailableHalls = data.availableHalls.filter(hall => hall !== currentHall);
      if (updatedAvailableHalls.length === 0) updatedAvailableHalls = ["No Hall Available"];

      console.log("✅ Final Available Halls (Filtered):", updatedAvailableHalls);
      setAvailableHalls(updatedAvailableHalls);
    } catch (error) {
      console.error("❌ Error fetching available halls:", error);
      toast.error("Failed to fetch available halls.");
      setAvailableHalls(["No Hall Available"]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return toast.error("You must be logged in to update a booking.");

    const token = await getIdToken(user);

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/admin/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ selectedHall: formData.selectedHall, status: formData.status, hallType: booking.hallType }),
      });

      if (!response.ok) throw new Error("Error updating booking");
      toast.success("Booking updated successfully!");
      fetchAvailableHalls(booking.date, booking.startTime, booking.endTime, booking.hallType, formData.selectedHall);
      setTimeout(() => navigate("/admin/view-bookings"), 2000);
    } catch (error) {
      toast.error("Error updating booking!");
      console.error("❌ Error updating booking:", error);
    }
  };

  if (!booking) return <p>Loading...</p>;

  return (
    <div className="admin-edit-booking-layout">
      <AdminSidebar />
      <div className="admin-edit-booking-content">
        <div className="admin-edit-booking-container">
          <h4>Manage Booking</h4>
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label>Name:</label>
              <input type="text" value={booking.name} readOnly />
            </div>
            <div className="admin-form-group">
              <label>Email:</label>
              <input type="email" value={booking.userEmail} readOnly />
            </div>
            <div className="admin-form-group">
              <label>Purpose:</label>
              <textarea value={booking.purpose} readOnly></textarea>
            </div>
            <div className="admin-form-group">
              <label>Hall:</label>
              <select name="selectedHall" value={formData.selectedHall} onChange={handleChange} required>
                <option value="">-- Select Available Hall --</option>
                {availableHalls.map((hall, index) => (
                  <option key={index} value={hall}>{hall}</option>
                ))}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Status:</label>
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <button type="submit" className="admin-save-btn">Confirm Changes</button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default AdminEditBooking;

