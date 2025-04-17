import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Notifications.css';

function Notifications() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser) {
            axios.get(`/api/notifications?userId=${storedUser.id}`)
                .then(response => setNotifications(response.data))
                .catch(error => console.error('Error fetching notifications:', error));
        }
    }, []);

    const markAsRead = async (id) => {
        await axios.put(`/api/notifications/mark-as-read/${id}`);
        setNotifications(notifications.map((notif) => 
            notif._id === id ? { ...notif, isRead: true } : notif
        ));
    };

    return (
        <div className="notifications-container">
            <h2>Notifications</h2>
            {notifications.map(notification => (
                <div
                    key={notification._id}
                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                    onClick={() => markAsRead(notification._id)}
                >
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
}

export default Notifications;
