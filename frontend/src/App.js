import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/user/UserModule'; 
import BookingForm from './pages/user/BookingForm';
import MyBookings from "./pages/user/MyBookings";
import EditBooking from "./pages/user/EditBooking"; 
import AdminModule from "./pages/admin/AdminModule";
import ViewBookings from "./pages/admin/ViewBookings"; // ✅ Import ViewBookings component
import AdminEditBooking from "./pages/admin/AdminEditBooking"; 


function App() {
  return (
    <Router>
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/user" element={<Dashboard />} />
          <Route path="/book-hall" element={<BookingForm />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/edit-booking/:id" element={<EditBooking />} />
          <Route path="/admin" element={<AdminModule />} /> 
          <Route path="/admin/view-bookings" element={<ViewBookings />} />
          <Route path="/admin-edit-booking/:id" element={<AdminEditBooking />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
