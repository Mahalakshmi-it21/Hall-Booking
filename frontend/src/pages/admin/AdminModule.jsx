import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminModule.module.css"; 
import AdminSidebar from "../../components/AdminSidebar";
import adminIcon from "../../assets/adminicon2.png";
import bellIcon from "../../assets/bellicon.png";
import leftArrowIcon from "../../assets/left-arrow.png";
import rightArrowIcon from "../../assets/right-arrow.png";
import { adminSignOut } from "../../components/auth";
import axios from 'axios';
import socket from "../../socket"; // adjust path if needed
import { toast } from "react-toastify"; // already installed if you’re using toast messages


function AdminDashboard() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLogout, setShowLogout] = useState(false);
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();

    
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
        await adminSignOut();
        sessionStorage.removeItem("admin");
        navigate("/");
    };

    useEffect(() => {
        const storedAdmin = sessionStorage.getItem("admin");
        if (storedAdmin) {
            const parsedAdmin = JSON.parse(storedAdmin);
            setAdmin(parsedAdmin);
            socket.connect();
            socket.on("notification", (message) => {
                toast.info(message);
                setUnreadCount(prev => prev + 1);
            });
    
            const fetchNotifications = async () => {
                try {
                    const token = parsedAdmin.token; // assuming token is stored
                    const response = await axios.get('/api/notifications', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUnreadCount(response.data.filter(n => !n.isRead).length);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };
            fetchNotifications();
        } else {
            console.log("❌ No admin found in sessionStorage");
        }
    
        return () => {
            socket.disconnect();
            socket.off("notification");
        };
    }, []);
    

    return (
        <div className={styles.adminDashboardLayout}>
            <AdminSidebar />
            <div className={styles.adminContentContainer}>
                <div className={styles.adminWhiteCard}>
                    <div className={styles.adminProfileContainer}>
                        <div className={styles.notificationContainer}>
                            <div className={styles.bellIcon}>
                                <img src={bellIcon} alt="Notifications" />
                                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
                            </div>
                        </div>

                        <div className={styles.profileAvatar}>
                            <img
                                src={admin?.photoURL || adminIcon}
                                alt="Admin Avatar"
                                onClick={() => setShowLogout(!showLogout)}
                            />
                            <div className={styles.text}>Admin</div>

                            {showLogout && (
                                <div className={`${styles.logoutMenu} visible`}>
                                    <button onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <h3>Welcome to Library Hall Booking System, Admin!</h3>
                    <div className={styles.tileCarousel}>
                        {currentIndex > 0 && (
                            <div className={styles.arrowLeft} onClick={scrollLeft}>
                                <img src={leftArrowIcon} alt="Left Arrow" />
                            </div>
                        )}

                        <div className={styles.tilesWrapper}>
                            {images.slice(currentIndex, currentIndex + 3).map((image, index) => (
                                <div className={styles.tile} key={index}>
                                    <img src={image} alt={`Library ${index + 1}`} className={styles.tileImage} />
                                </div>
                            ))}
                        </div>

                        {currentIndex < images.length - 3 && (
                            <div className={styles.arrowRight} onClick={scrollRight}>
                                <img src={rightArrowIcon} alt="Right Arrow" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
