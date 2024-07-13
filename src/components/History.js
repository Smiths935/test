// src/History.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebaseConfig';
import './History.css';

const History = () => {
    const [meetings, setMeetings] = useState([]);
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const [filterDate, setFilterDate] = useState('');
    const [user] = useAuthState(auth);

    useEffect(() => {
        if (user) {
            fetchMeetings();
        }
    }, [user]);

    useEffect(() => {
        filterMeetingsByDate();
    }, [filterDate, meetings]);

    const fetchMeetings = async () => {
        const q = query(collection(db, 'meetings'), where('participants', 'array-contains', user.email));
        const querySnapshot = await getDocs(q);
        const meetingsData = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const dateHeure = data.dateHeure ? data.dateHeure.toDate().toLocaleString() : "Date inconnue";
            meetingsData.push({ id: doc.id, ...data, dateHeure });
        });
        setMeetings(meetingsData);
        setFilteredMeetings(meetingsData);
    };

    const handleDateChange = (event) => {
        setFilterDate(event.target.value);
    };

    const filterMeetingsByDate = () => {
        if (filterDate) {
            const filtered = meetings.filter(meeting =>
                new Date(meeting.dateHeure) >= new Date(filterDate)
            );
            setFilteredMeetings(filtered);
        } else {
            setFilteredMeetings(meetings);
        }
    };

    return (
        <div className="history-container">
            <div className="history-header">
                <h2>Historique des Réunions Planifiées</h2>
                <input 
                    type="date" 
                    className="history-filter" 
                    value={filterDate} 
                    onChange={handleDateChange} 
                />
            </div>
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Titre</th>
                        <th>Description</th>
                        <th>Date et Heure</th>
                        <th>Lien</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMeetings.map((meeting) => (
                        <tr key={meeting.id}>
                            <td>{meeting.title}</td>
                            <td>{meeting.description}</td>
                            <td>{meeting.dateHeure}</td>
                            <td><a href={`/video-meeting/${meeting.id}`} target="_blank" rel="noopener noreferrer"><button className="join-button">Rejoindre</button></a></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default History;
