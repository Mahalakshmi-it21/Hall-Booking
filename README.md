# Library Hall Booking Portal

## Overview

The **Library Hall Booking Portal** is a web application built using the **MERN stack** (MongoDB, Express.js, React, Node.js) that allows users to book halls for various events and meetings. The system supports different types of halls (conference and discussion halls), and provides an admin interface for managing bookings. Users can book halls based on availability, view and manage their bookings, and receive real-time updates.

### Features
- **User Module**:
  - Sign in via Google or with username/password (Admin login).
  - Book conference or discussion halls.
  - View and manage existing bookings.
  - Real-time updates for booking status.
  - Notifications system (both in-app and via email).

- **Admin Module**:
  - Admin authentication (username/password login).
  - Approve, reject, or modify bookings.
  - View all bookings and hall availability.
  - Real-time updates for hall allocation and booking status.
  - Notifications system for admin alerts.

## Technologies Used
- **Frontend**:
  - React.js
  - CSS for styling
  - Firebase for authentication
  - WebSocket for real-time communication
  - Axios for HTTP requests

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - Firebase Admin SDK for authentication
  - Multer for file uploads
  - Socket.io for real-time communication

## Getting Started

### Prerequisites
- Node.js (>= 14.x)
- MongoDB (local or remote instance)
- Firebase project (for authentication)
  
### Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Mahalakshmi-it21/Library-Hall-Booking.git
   cd Library-Hall-Booking
