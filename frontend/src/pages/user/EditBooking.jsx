import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditBooking.css";

const EditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "Student",
    date: "",
    fromTime: "",
    toTime: "",
    attendees: "",
    purpose: "",
    proof: "",
    bookingType: "hall", // New Field ✅
    hallType: "", // New Field ✅
    floor: "", // New Field ✅
  });

  // ✅ Fetch Booking Data
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error fetching booking");
        }

        setBooking(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          designation: data.designation || "Student",
          date: data.date ? new Date(data.date).toISOString().split("T")[0] : "",
          fromTime: data.startTime || "",
          toTime: data.endTime || "",
          attendees: data.attendees || "",
          purpose: data.purpose || "",
          proof: data.proof || "",
          bookingType: data.bookingType || "hall", // ✅ Ensure existing value is set
          hallType: data.hallType || "",
          floor: data.floor || "",
        });
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast.error("Failed to fetch booking details.");
      }
    };

    fetchBooking();
  }, [id]);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle File Upload
  const handleFileChange = (e) => {
    setFormData({ ...formData, proof: e.target.files[0] });
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/user/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "Error updating booking");
      }
  
      toast.success("Changes saved successfully!");
      setTimeout(() => navigate("/my-bookings"), 2000);
    } catch (error) {
      toast.error("Error updating booking!");
      console.error("Error updating booking:", error);
    }
  };
  
  // ✅ Handle Booking Deletion
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
          method: "DELETE",
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error || "Error deleting booking");
        }

        toast.success("Booking cancelled successfully!");
        setTimeout(() => navigate("/my-bookings"), 2000);
      } catch (error) {
        toast.error("Error deleting booking!");
        console.error("Error deleting booking:", error);
      }
    }
  };

  if (!booking) return <p>Loading...</p>;

  return (
    <div className="edit-booking-layout">
      <Sidebar />
      <div className="edit-booking-container">
        <h4>Edit Booking</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} readOnly />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} readOnly />
          </div>
          <div className="form-group">
            <label>Designation:</label>
            <select name="designation" value={formData.designation} onChange={handleChange} required>
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>From Time:</label>
            <input type="time" name="fromTime" value={formData.fromTime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>To Time:</label>
            <input type="time" name="toTime" value={formData.toTime} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Number of Attendees:</label>
            <input type="number" name="attendees" value={formData.attendees} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Purpose:</label>
            <textarea name="purpose" value={formData.purpose} onChange={handleChange} required></textarea>
          </div>

          {/* ✅ Booking Type Selection */}
          <div className="form-group">
            <label>Booking Type:</label>
            <select name="bookingType" value={formData.bookingType} onChange={handleChange}>
              <option value="hall">Conference/Discussion Hall</option>
              <option value="floor">Library Floor</option>
            </select>
          </div>

          {/* ✅ If "hall" is selected, show hallType dropdown */}
          {formData.bookingType === "hall" && (
            <div className="form-group">
              <label>Select Hall Type:</label>
              <select name="hallType" value={formData.hallType} onChange={handleChange} required>
                <option value="">-- Select --</option>
                <option value="conference">Conference Hall</option>
                <option value="discussion">Discussion Hall</option>
              </select>
            </div>
          )}

          {/* ✅ If "floor" is selected, show floor selection */}
          {formData.bookingType === "floor" && (
            <div className="form-group">
              <label>Select Floor:</label>
              <select name="floor" value={formData.floor} onChange={handleChange} required>
                <option value="">-- Select --</option>
                <option value="1">Ground Floor</option>
                <option value="2">First Floor</option>
                <option value="3">Second Floor</option>
                <option value="4">Third Floor</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Proof (Upload Document):</label>
            <input type="file" name="proof" onChange={handleFileChange} />
            {formData.proof && <p>Current File: {typeof formData.proof === "string" ? formData.proof : formData.proof.name}</p>}
          </div>

          <div className="button-group">
            <button type="submit" className="save-btn">Confirm Changes</button>
            <button type="button" className="delete-btn" onClick={handleDelete}>Cancel Booking</button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default EditBooking;
