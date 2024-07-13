import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import './MeetingDetails.css';

const MeetingDetails = () => {
    const { id } = useParams();
    const [meetingData, setMeetingData] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMeetingData = async () => {
            const meetingDocRef = doc(db, "meetings", id);
            const meetingDoc = await getDoc(meetingDocRef);
            if (meetingDoc.exists()) {
                const data = meetingDoc.data();
                setMeetingData(data);
                setTimeLeft(new Date(data.dateHeure) - new Date());
            } else {
                navigate('/home');
            }
        };
        fetchMeetingData();
    }, [id, navigate]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(timeLeft - 1000);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const startMeeting = () => {
        navigate(`/video-meeting/${id}`);
    };

    const formatTimeLeft = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    return (
        <div className="meeting-details-container">
            {meetingData && (
                <>
                    <h2>Détails de la Réunion</h2>
                    <p>Vous êtes sur le point de démarrer la réunion suivante :</p>
                    <p><strong>Titre :</strong> {meetingData.title}</p>
                    <p><strong>Date et Heure :</strong> {new Date(meetingData.dateHeure).toLocaleString()}</p>
                    <p>Cette fonctionnalité vous permet de démarrer une réunion à l'heure prévue. Le bouton de démarrage sera activé lorsque l'heure de la réunion sera atteinte. Veuillez patienter jusqu'à ce que le chronomètre atteigne zéro.</p>
                    <button onClick={startMeeting} disabled={timeLeft > 0}>
                        {timeLeft > 0 ? `Démarrer la réunion (${formatTimeLeft(timeLeft)})` : 'Démarrer la réunion'}
                    </button>
                </>
            )}
        </div>
    );
};

export default MeetingDetails;
