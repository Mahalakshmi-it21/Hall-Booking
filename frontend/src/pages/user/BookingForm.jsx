import React, { useState, useEffect } from 'react';
import './BookingForm.css';
import Sidebar from '../../components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingForm = () => {
  // ✅ Get user details from localStorage using useState
  const [storedUser, setStoredUser] = useState(() => JSON.parse(sessionStorage.getItem("user")) || {});

  
  const [formData, setFormData] = useState({
    designation: 'Student',
    date: '',
    fromTime: '',
    toTime: '',
    attendees: '',
    purpose: '',
    proof: null,
    bookingType: 'hall', // New field to choose between hall or floor
    hallType: '', // Stores Conference/Discussion choice
    floor: '', // Stores selected floor
  });

  useEffect(() => {
    const userFromStorage = JSON.parse(sessionStorage.getItem("user")) || {};
    setStoredUser(userFromStorage); // ✅ Ensures storedUser updates
    if (!userFromStorage.email) {
      toast.error("User not found! Please log in again.");
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, proof: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const today = new Date().toISOString().split("T")[0]; // Get today's date

    if (formData.date < today) {
      toast.error("You cannot book a hall for past dates!");
      return;
    }
  
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {}; 

  
    if (!storedUser.email) {
      toast.error("User email is missing. Please log in again.");
      return;
    }
  
    // ✅ Ensure all fields are filled
    if (!formData.purpose || !formData.date || !formData.fromTime || !formData.toTime || !formData.attendees) {
      toast.error("Please fill in all fields before submitting.");
      return;
    }
    
    if (formData.bookingType === 'hall' && !formData.hallType) {
      toast.error("Please select Conference or Discussion Hall.");
      return;
    }
    
    if (formData.bookingType === 'floor' && !formData.floor) {
      toast.error("Please select a floor to book.");
      return;
    }

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("purpose", formData.purpose);
      formDataToSubmit.append("date", formData.date);
      formDataToSubmit.append("startTime", formData.fromTime);
      formDataToSubmit.append("endTime", formData.toTime);
      formDataToSubmit.append("attendees", formData.attendees);
      formDataToSubmit.append("userEmail", storedUser.email);
      formDataToSubmit.append("bookingType", formData.bookingType);

      // ✅ Ensure `selectedHall` and `hallType` are correctly assigned
      const selectedHall = formData.bookingType === "hall" ? formData.hallType : formData.floor;

      if (!selectedHall || selectedHall.trim() === "") {
        toast.error("Please select a valid hall type or floor.");
        return;
      }

      formDataToSubmit.append("selectedHall", selectedHall);

      // ✅ Ensure `hallType` is explicitly included
      if (formData.bookingType === "hall") {
        formDataToSubmit.append("hallType", formData.hallType);
      } else {
        formDataToSubmit.append("hallType", "floor");  // ✅ If booking a floor, mark as "floor"
      }

      if (formData.proof) {
        formDataToSubmit.append("proof", formData.proof);
      }

      const response = await fetch("http://localhost:5000/api/bookings/", {
        method: "POST",
        body: formDataToSubmit,
      });

      const responseData = await response.json();
      console.log("📌 Server Response:", responseData); 

      if (response.ok) {
        toast.success("Hall booking request submitted successfully!");
        setFormData({
          designation: "Student",
          date: "",
          fromTime: "",
          toTime: "",
          attendees: "",
          purpose: "",
          proof: null,
          bookingType: "hall",
          hallType: "",
          floor: "",
        });
      } else {
        toast.error(responseData.error || "Error submitting booking request");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Error submitting booking request: " + error.message);
    }
};

  
  
  

  return (
    <div className="booking-form-layout">
      <Sidebar />
      <div className="form-content">
        <div className="booking-form-container">
          <center>
            <h4>Hall Booking Form</h4>
          </center>
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label><input type="text" value={storedUser?.name || "Guest User"} readOnly />


            </div>
            <div className="form-group">
              <label>Email:</label>
              
              <input type="email" value={storedUser?.email || "No Email"} readOnly />
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
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              min={new Date().toISOString().split("T")[0]} // ✅ Prevent past dates
              onChange={handleChange} 
              required 
            />
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

            <div className="form-group">
              <label>Proof (Upload Document):</label>
              <input type="file" name="proof" onChange={handleFileChange} />
            </div>
            <div className="form-group">
              <label>Booking Type:</label>
              <select name="bookingType" value={formData.bookingType} onChange={handleChange}>
                <option value="hall">Conference/Discussion Hall</option>
                <option value="floor">Library Floor</option>
              </select>
            </div>
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
            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default BookingForm;