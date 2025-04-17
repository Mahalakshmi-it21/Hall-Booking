import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserModule.css";
import Sidebar from "../../components/Sidebar";
import userIcon from "../../assets/usericon.png";
import bellIcon from "../../assets/bellicon.png";
import leftArrowIcon from "../../assets/left-arrow.png";
import rightArrowIcon from "../../assets/right-arrow.png";
import { googleSignOut } from "../../components/auth";
import axios from 'axios';
import socket from "../../socket"; // adjust path if needed
import { toast } from "react-toastify"; // already installed if you’re using toast messages


function Dashboard() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLogout, setShowLogout] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      socket.connect();
      socket.on("notification", (message) => {
        toast.info(message);
        setUnreadCount(prev => prev + 1);
      });
  

      const fetchNotifications = async () => {
        try {
          const token = parsedUser.token;
          const response = await axios.get('/api/notifications', {
            headers: {Authorization: `Bearer ${token}`,
            },
          });
                    setUnreadCount(response.data.filter(notification => !notification.isRead).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
    } else {
      console.log("❌ No user found in sessionStorage");
    }
    return () => {
      socket.disconnect();
      socket.off("notification");
  };
  }, []);
  

  const images = [
    require("../../assets/lib1.jpg"),
    require("../../assets/lib2.jpg"),
    require("../../assets/lib3.jpg"),
    require("../../assets/lib4.jpg"),
    require("../../assets/lib5.jpg"),
    require("../../assets/lib6.jpg"),
  ];

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const scrollRight = () => {
    if (currentIndex < images.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleLogout = async () => {
    await googleSignOut();
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="content-container">
        <div className="white-card">
          <div className="profile-container">
          <div className="bell-icon" onClick={() => navigate('/notifications')}>
    <img src={bellIcon} alt="Notifications" />
    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</div>
            <div className="profile-avatar">
              <div className="profile-img">
                {user && user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User Avatar"
                    referrerPolicy="no-referrer"
                    onClick={() => setShowLogout(!showLogout)}
                  />
                ) : (
                  <img src={userIcon} alt="Default Avatar" onClick={() => setShowLogout(!showLogout)} />
                )}
              </div>
              <div className="username">{user ? user.name : "Guest User"}</div>

              {showLogout && (
                <div className="logout-menu visible">
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
          <h3>Welcome to the Library Hall Booking System!</h3>
          <div className="tile-carousel">
            {currentIndex > 0 && (
              <div className="arrow arrow-left" onClick={scrollLeft}>
                <img src={leftArrowIcon} alt="Left Arrow" style={{ width: "20px", height: "20px" }} />
              </div>
            )}
            <div className="tiles-wrapper">
              {images.slice(currentIndex, currentIndex + 3).map((image, index) => (
                <div className="tile" key={index}>
                  <img src={image} alt={`Library ${index + 1}`} className="tile-image" />
                </div>
              ))}
            </div>
            {currentIndex < images.length - 3 && (
              <div className="arrow arrow-right" onClick={scrollRight}>
                <img src={rightArrowIcon} alt="Right Arrow" style={{ width: "20px", height: "20px" }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
