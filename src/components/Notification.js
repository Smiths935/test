// src/Notification.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebaseConfig';
import './Notification.css';

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    useEffect(() => {
        filterNotificationsByDate();
    }, [filterDate, notifications]);

    const fetchNotifications = async () => {
        const q = query(collection(db, 'notifications'), where('recipient', '==', user.email));
        const querySnapshot = await getDocs(q);
        const notificationsData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const timestamp = data.timestamp ? data.timestamp.toDate().toLocaleString() : "Date inconnue";
            notificationsData.push({ id: doc.id, ...data, timestamp });
        });
        setNotifications(notificationsData);
        setFilteredNotifications(notificationsData);
    };

    const markAsRead = async (id) => {
        const notificationDoc = doc(db, 'notifications', id);
        await updateDoc(notificationDoc, { read: true });
        setNotifications(notifications.map(notification => 
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const handleDateChange = (event) => {
        setFilterDate(event.target.value);
    };

    const filterNotificationsByDate = () => {
        if (filterDate) {
            const filtered = notifications.filter(notification =>
                new Date(notification.timestamp) >= new Date(filterDate)
            );
            setFilteredNotifications(filtered);
        } else {
            setFilteredNotifications(notifications);
        }
    };

    return (
        <div className="notification-container">
            <div className="notification-header">
                <h2>Notifications</h2>
                <input 
                    type="date" 
                    className="notification-filter" 
                    value={filterDate} 
                    onChange={handleDateChange} 
                />
            </div>
            <ul className="notification-list">
                {filteredNotifications.map((notification) => (
                    <li key={notification.id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                        <p>{notification.message}</p>
                        <p className="timestamp">{notification.timestamp}</p>
                        {notification.link && <a href={notification.link} target="_blank" rel="noopener noreferrer">Rejoindre</a>}
                        {!notification.read && <button onClick={() => markAsRead(notification.id)}>Marquer comme lu</button>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Notification;
